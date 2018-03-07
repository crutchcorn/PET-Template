import {Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {TimeoutService} from './timeout.service';

@Injectable()
export class TimeoutInterceptor implements HttpInterceptor {
  constructor(private timeoutService: TimeoutService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.url !== '/api/auth/signout') { // To prevent eternal loops if fails
      this.timeoutService.setTime();
    }
    return next.handle(request);
  }
}



