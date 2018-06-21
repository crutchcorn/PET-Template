import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MatSnackBar} from '@angular/material';

import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

import {User, UserWithoutRole} from '../user/user';
import {TimeoutService} from '../timeout/timeout.service';

import {Store} from '@ngrx/store';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {State} from '../reducers';
import {LoadUser, UnloadUser} from '../user/user.actions';

import * as cookie from 'cookie';


@Injectable()
export class AuthService {
  public redirectUrl: string;
  public remember = false;

  constructor(private http: HttpClient,
              private timeoutService: TimeoutService,
              private store: Store<State>,
              private router: Router,
              private location: Location) {
  }

  signup(newUser: UserWithoutRole): Observable<User> {
    return this.http
      .post<User>('/api/auth/signup', newUser)
      // TODO: Add a snackbar that congratulates them on signing up - starts tutorial in component logic using `seen` or not
      .pipe(tap());
  }

  /**
   * Login function
   * @param {string} usernameOrEmail - Username or email address of user you'd like to login to
   * @param {string} password - Password for the user you'd like to login to
   * @param {boolean} remember - Default false - Toggle for the server's "remember me" function. If true, it will keep
   * the session active for 2 weeks of inactivity
   * @returns {Observable<User>}
   */
  login(usernameOrEmail: string, password: string, remember = false): Observable<User> {
    return this.http
      .post<User>('/api/auth/signin', {usernameOrEmail, password, remember})
      .pipe(tap((user: User) => {
        if (remember) {
          this.remember = true;
        }
        this.timeoutService.setTime();
        this.authAccept(user);
      }));
  }

  loginGithub(): Observable<User> {
    return this.http
      .get<User>('/api/auth/github')
      .pipe(tap((user: User) => {
        this.timeoutService.setTime();
        this.authAccept(user);
      }));
  }

  get token(): string {
    return cookie.parse(document.cookie)['sessionId'];
  }

  set token(token: string) {
    document.cookie = cookie.serialize('sessionId', token || '', {path: '/'});
  }

  logout(): void {
    this.http
      .get<{ message: string }>('/api/auth/signout')
      .subscribe(() => {
        this.router.navigate(['/'], {
          queryParams: {
            signout: true
          }
        });
        this.nullifyAuth();
      });
  }

  /**
   * Handle the generic login logic when a user's login is accepted
   * @param {User} user - User that's auth credentials have been accepted
   */
  authAccept(user: User): void {
    this.timeoutService.enable();
    this.store.dispatch(new LoadUser(user));
    if (this.redirectUrl) {
      this.router.navigate([this.redirectUrl]);
      this.redirectUrl = null;
    }
  }

  /**
   * Handle the generic logic for when the user should be forcibly logged out of the system
   */
  invalidateUser(): void {
    // Added redirectURL here so that we can catch all errors, not just ones that are tagged
    this.redirectUrl = this.location.path();
    this.nullifyAuth();
    this.router.navigate(['/login', {queryParams: {forced: true}}]);
  }

  /**
   * Handle the generic logic for all functions that involve handling "booting" the user, forcibly or otherwise
   */
  nullifyAuth(): void {
    this.token = null;
    this.remember = false;
    this.timeoutService.disable();
    this.store.dispatch(new UnloadUser());
  }

  forgotPass(usernameOrEmail: string): Observable<{token: string}> {
    return this.http.post<{token: string}>('/api/auth/forgot', {usernameOrEmail});
  }

  validateToken(token: string): Observable<{token: string}> {
    return this.http.get<{token: string}>(`/api/auth/reset/${token}`);
  }

  resetPassword(token: string, newPassword: string, verifyPassword: string): Observable<{token: string}> {
    return this.http.post<{token: string}>(`/api/auth/reset/${token}`, {newPassword, verifyPassword});
  }
}
