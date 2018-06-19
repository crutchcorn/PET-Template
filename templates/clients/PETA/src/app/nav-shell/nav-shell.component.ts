import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {merge, Observable, Subject} from 'rxjs';
import {distinctUntilChanged, filter, map, mergeMap, share, take} from 'rxjs/operators';
import {ActivatedRoute, ChildActivationEnd, NavigationEnd, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {getUser, State} from '../core/reducers';
import {AuthService} from '../core/auth/auth.service';

@Component({
  selector: 'nav-shell',
  templateUrl: './nav-shell.component.html',
  styleUrls: ['./nav-shell.component.scss']
})
export class NavShellComponent {
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    )
    .pipe(share());

  title$ = this.router.events
    .pipe(filter(e => e instanceof NavigationEnd))
    .pipe(map(() => {
      let route = this.activatedRoute;

      while (route.firstChild) {
        route = route.firstChild;
      }

      return route;
    }))
    .pipe(filter((route) => route.outlet === 'primary'))
    .pipe(mergeMap((route) => route.data))
    .pipe(map(data => data['title'] || '{{titleCase name}}'));

  getUserName$ = this.store.select(getUser)
    .pipe(map(user => (user && user.displayName) || null));

  constructor(private breakpointObserver: BreakpointObserver,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private store: Store<State>,
              private authService: AuthService) {
  }

  logout() {
    this.authService.logout();
  }
}
