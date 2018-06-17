import {Injectable} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Subject, timer} from 'rxjs';
import {finalize, takeUntil} from 'rxjs/operators';

@Injectable()
export class TitleBlinkerService {
  stopBlinker = new Subject();

  constructor(private title: Title) {
  }

  blink(msg: string): void {
    const prevTitle = this.title.getTitle();
    timer(1000, 1000)
      .pipe(takeUntil(this.stopBlinker))
      .pipe(finalize(() => {
        this.title.setTitle(prevTitle);
      }))
      .subscribe(() => {
        const newTitle = this.title.getTitle() === prevTitle ?
          msg : prevTitle;

        this.title.setTitle(newTitle);
      });
  }
}
