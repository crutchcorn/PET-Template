import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';

@Injectable()
export class TimeoutService {
  maxAge = 24 * (60 * 60 * 1000);
  // session can be made to "remember me" and change the maxAge to two weeks
  rememberMaxAge = 2 * 7 * 24 * (60 * 60 * 1000);

  active = false;

  time = new Subject();
  disabled = new Subject();

  constructor() { }

  enable() {
    this.active = true;
  }

  setTime() {
    this.time.next();
  }

  disable() {
    this.active = false;
    this.disabled.next();
  }
}
