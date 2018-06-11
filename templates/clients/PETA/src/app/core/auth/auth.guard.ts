import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateChild} from '@angular/router';
import {Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import {UserService} from '../user/user.service';
import {AuthService} from './auth.service';
import {map} from 'rxjs/operators';
import * as fromRoot from '../reducers';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {
  authenticated = false;

  constructor(private store: Store<fromRoot.State>,
              private router: Router,
              private userService: UserService,
              private authService: AuthService) {
    this.store.select(fromRoot.getUser)
      .subscribe(user => this.authenticated = !!user);
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.generalCanActivate(state.url);
  }

  canActivate(next: ActivatedRouteSnapshot,
              state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.generalCanActivate(state.url);
  }

  generalCanActivate(url?: string) {
    if (!this.authenticated) {
      return this.userService.fetchUser()
        .pipe(map(usr => {
          if (!!usr) {
            this.authService.authAccept(usr);
            return true;
          } else {
            // GOT A 403 ERROR WHICH WILL CALL AUTH INTERCEPTOR. ONLY CALLING FALSE JUST TO BE SAFE
            return false;
          }
        }));
    }
    return this.authenticated;
  }
}
