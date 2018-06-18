import {Component, OnInit} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {merge, Observable, Subject} from 'rxjs';
import {distinctUntilChanged, filter, map} from 'rxjs/operators';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {getUser, State} from '../core/reducers';
import {AuthService} from '../core/auth/auth.service';

@Component({
  selector: 'nav-shell',
  templateUrl: './nav-shell.component.html',
  styleUrls: ['./nav-shell.component.scss']
})
export class NavShellComponent implements OnInit {

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  private routerSubject = new Subject<boolean>();

  getRouteData$ = merge(this.routerSubject, this.router.events)
    .pipe(filter(event => event instanceof NavigationEnd || event === true))
    .pipe(distinctUntilChanged())
    .pipe(map(() =>
      (this.activatedRoute.routeConfig.data && this.activatedRoute.routeConfig.data.title) || '{{titleCase name}}')
    );

  getUserName$ = this.store.select(getUser)
    .pipe(map(user => (user && user.displayName) || null));

  constructor(private breakpointObserver: BreakpointObserver,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private store: Store<State>,
              private authService: AuthService) {
  }

  ngOnInit() {
    this.routerSubject.next(true);
    this.getRouteData$.subscribe(res => console.log(res));
  }

  logout() {
    this.authService.logout();
  }
}
