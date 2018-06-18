import {Component, OnInit} from '@angular/core';
import {AuthService} from '../core/auth/auth.service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {MatSnackBar} from '@angular/material';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: '{{dashCase name}}-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  incorrect = false;
  defaultRoute = ['/posts'];
  form: FormGroup = this.fb.group({
    usernameOrEmail: [null, Validators.required],
    password: [null, Validators.required]
  });

  constructor(private activeRoute: ActivatedRoute,
              private snackBar: MatSnackBar,
              private authService: AuthService,
              private router: Router,
              private fb: FormBuilder) {
  }

  ngOnInit() {
    this.activeRoute.params.subscribe((params: Params) => {
      if (params['forced']) {
        this.snackBar.open('You\'ve been forcably logged out. ' +
          'Please log back in to be redirected back to where you were', 'Confirm');
      }
    });
  }

  login() {
    this.authService.login(this.form.get('usernameOrEmail').value, this.form.get('password').value)
      .subscribe(() => {
        // Please keep in mind that if the user has a redirect URL, the auth interceptor
        // will redirect them to that URL and not to the `posts` section
        this.router.navigate(this.defaultRoute);
        // TODO: Do more to differenciate between telling user if no account or not
      }, () => this.incorrect = true);
  }
}
