import {Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse, HttpResponse
} from '@angular/common/http';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {AuthService} from './auth.service';
import * as fromRoot from '../reducers';
import * as userActions from '../../core/user/user.actions';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private store: Store<fromRoot.State>,
              private router: Router,
              private authService: AuthService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next
      .handle(request)
      .do((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // Do nothing for now
        }
      })
      .catch(response => {
        if (response instanceof HttpErrorResponse) {
          if (response.status === 403) {
            this.authService.nullifyAuth();
            this.router.navigate(['/login']);
          }
        }

        return Observable.throw(response);
      });
  }
}



