import {Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {TimeoutService} from './timeout.service';
import {isOurAPICall} from '../../shared/functions/api';

@Injectable()
export class TimeoutInterceptor implements HttpInterceptor {
  constructor(private timeoutService: TimeoutService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (isOurAPICall(request.url) && (request.url !== '/api/auth/signout' || request.url !== '/api/auth/signin')) { // To prevent eternal loops if fails
      this.timeoutService.setTime();
    }
    return next.handle(request);
  }
}



