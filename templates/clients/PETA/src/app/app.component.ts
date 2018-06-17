import {Component, OnInit} from '@angular/core';
import {switchMap, take} from 'rxjs/operators';
import {timer} from 'rxjs';

import {TimeoutService} from './core/timeout/timeout.service';
import {AuthService} from './core/auth/auth.service';
import {MatDialog, MatDialogRef} from '@angular/material';
import {UserService} from './core/user/user.service';
import {TitleBlinkerService} from './core/titleblinker/title-blinker.service';

@Component({
  selector: '{{dashCase name}}-stay-logged-in-dialog',
  template: `
    <h1 mat-dialog-title>Timeout Warning</h1>
    <div mat-dialog-content>
      <p>Due to session inactivity, you will be logged out in 10 minutes.</p>
    </div>
    <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="false">Ignore</button>
      <button mat-button [mat-dialog-close]="true" cdkFocusInitial>Stay Logged In</button>
    </div>
  `
})
export class StayLoggedInDialogComponent {
  constructor(private dialogRef: MatDialogRef<StayLoggedInDialogComponent>,
              private timeoutService: TimeoutService) {
    this.timeoutService.disabled.subscribe(() => {
      this.dialogRef.close();
    });
  }
}

@Component({
  selector: '{{dashCase name}}-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  tenMinutes = 10 * 1000 * 60;
  dialogRef: MatDialogRef<StayLoggedInDialogComponent>;

  constructor(private timeoutService: TimeoutService,
              private authService: AuthService,
              public dialog: MatDialog,
              private userService: UserService,
              private blinkerService: TitleBlinkerService) {
  }

  getTimer(timeOffset: number = 0) {
    return this.timeoutService.time
      .pipe(switchMap(() => timer(this.authService.remember ?
        this.timeoutService.rememberMaxAge - timeOffset :
        this.timeoutService.maxAge - timeOffset)))
  }

  ngOnInit() {
    this.getTimer(this.tenMinutes)
      .subscribe(() => {
        // TODO: Add push support
        if (this.timeoutService.active) {
          this.dialogRef = this.dialog.open(StayLoggedInDialogComponent);
          this.blinkerService.blink('Activity required to stay logged in!');
          this.dialogRef.afterClosed().subscribe(result => {
            this.blinkerService.stopBlinker.next();
            if (result) {
              this.userService.fetchUser()
                .pipe(take(1))
                .subscribe();
              this.dialogRef = null;
            }
          });
        }
      });

    this.getTimer()
      .subscribe(() => {
        if (this.timeoutService.active) {
          this.authService.invalidateUser();
          this.blinkerService.stopBlinker.next();
          if (this.dialogRef) {
            this.dialogRef.close();
          }
        }
      });
  }
}
