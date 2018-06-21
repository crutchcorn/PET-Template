
import {throwError as observableThrowError, Observable} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {AuthService} from './auth.service';
import * as fromRoot from '../reducers';

import {isOurAPICall} from '../../shared/functions/api';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private store: Store<fromRoot.State>,
              private router: Router,
              private authService: AuthService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next
      .handle(request)
      .pipe(catchError(response => {
        if (response instanceof HttpErrorResponse) {
          if (response.status === 403 && isOurAPICall(request.url)) {
            this.authService.invalidateUser();
          }
        }

        return observableThrowError(response);
      }));
  }
}
