import { Injectable } from '@angular/core';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class TimeoutService {
  active = false;

  time = new Subject();

  constructor() { }

  enable() {
    this.active = true;
  }

  setTime() {
    this.time.next();
  }

  disable() {
    this.active = false;
  }
}
