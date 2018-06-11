import {Component, OnInit} from '@angular/core';
import {switchMap, take, tap} from 'rxjs/operators';
import {timer} from 'rxjs';

import {TimeoutService} from './core/timeout/timeout.service';
import {AuthService} from './core/auth/auth.service';
import {MatDialog, MatDialogRef} from '@angular/material';
import {UserService} from './core/user/user.service';

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
  constructor() {
  }
}

@Component({
  selector: '{{dashCase name}}-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  tenMinutes = 60 * 1000 * 10;
  dialogRef: MatDialogRef<StayLoggedInDialogComponent>;

  constructor(private timeoutService: TimeoutService,
              private authService: AuthService,
              public dialog: MatDialog,
              private userService: UserService) {
  }

  ngOnInit() {
    this.timeoutService.time
      .pipe(switchMap(() => timer(this.authService.remember ?
        this.timeoutService.rememberMaxAge - this.tenMinutes:
        this.timeoutService.maxAge - this.tenMinutes)))
      .pipe(tap(() => {
        if (this.timeoutService.active) {
          this.dialogRef = this.dialog.open(StayLoggedInDialogComponent);
          this.dialogRef.afterClosed().subscribe(result => {
            if (result) {
              this.userService.fetchUser()
                .pipe(take(1)).subscribe();
              this.dialogRef = null;
            }
          });
        }
      }))
      .subscribe();

    this.timeoutService.time
      .pipe(switchMap(() => timer(this.authService.remember ? this.timeoutService.rememberMaxAge :
        this.timeoutService.maxAge)))
      .pipe(tap(() => {
        if (this.timeoutService.active) {
          this.authService.invalidateUser();
          if (this.dialogRef) {
            this.dialogRef.close();
          }
        }
      }))
      .subscribe();
  }
}
