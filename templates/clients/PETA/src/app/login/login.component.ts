import {Component, OnInit, ViewChild} from '@angular/core';
import {AuthService} from '../core/auth/auth.service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {MatSnackBar} from '@angular/material';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../core/user/user.service';
import {take} from 'rxjs/operators';
import {NgxSlideshowComponent} from 'ngx-slideshow';

@Component({
  selector: '{{dashCase name}}-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  @ViewChild(NgxSlideshowComponent) slideshow: NgxSlideshowComponent;
  incorrect = false;
  incorrectReset = false;
  showPass = false;
  resetToken: string;
  defaultRoute = ['/posts'];
  form: FormGroup = this.fb.group({
    usernameOrEmail: [null, Validators.required],
    password: [null, Validators.required]
  });
  resetForm: FormGroup = this.fb.group({
    usernameOrEmail: [null, Validators.required]
  });

  constructor(private activeRoute: ActivatedRoute,
              private snackBar: MatSnackBar,
              private authService: AuthService,
              private userService: UserService,
              private router: Router,
              private fb: FormBuilder) {
  }

  verifyAuth() {
    this.userService.fetchUser()
      .subscribe(user => {
        this.authService.authAccept(user);
        this.router.navigate(this.defaultRoute);
      });
  }

  ngOnInit() {
    this.activeRoute.params.subscribe((params: Params) => {
      if (params['forced']) {
        this.snackBar.open('You\'ve been forcably logged out. ' +
          'Please log back in to be redirected back to where you were', 'Confirm');
        // TODO: This will (not?) redirect back to path if use redirect logic - this should be changed on client and serv
      } else if (params['auth']) {
        this.verifyAuth();
      }
    });
  }

  login() {
    this.authService.login(this.form.get('usernameOrEmail').value, this.form.get('password').value)
      .pipe(take(1))
      .subscribe(() => {
        // Please keep in mind that if the user has a redirect URL, the auth interceptor
        // will redirect them to that URL and not to the `posts` section
        this.router.navigate(this.defaultRoute);
        // TODO: Do more to differentiate between telling user if no account or not
      }, err => {
        this.incorrect = true;
      });
  }

  reset() {
    this.authService.forgotPass(this.resetForm.get('usernameOrEmail').value)
      .pipe(take(1))
      .subscribe(res => {
        this.resetToken = res.token;
        this.slideshow.right();
      }, err => {
        // TODO: Switch to using error code instead
        // err.status
        if (err.error.message.includes('signed up using your')) {
          const snack = this.snackBar.open(err.error.message, 'Go Back To Login', {
            duration: 3000
          });
          snack.afterDismissed()
            .pipe(take(1))
            .subscribe(event => {
              if (event.dismissedByAction) {
                this.router.navigate(['/login'])
              }
            });
        } else {
          const snack = this.snackBar.open('You don\'t seem to have an account with us, why not create one?', 'Go to Signup', {
            duration: 3000
          });
          snack.afterDismissed()
            .pipe(take(1))
            .subscribe(event => {
              if (event.dismissedByAction) {
                this.router.navigate(['/signup'])
              }
            });
        }
      });
  }

  goToReset() {
    this.router.navigate(['/reset-password/', this.resetToken]);
  }
}
