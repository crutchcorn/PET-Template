import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {AuthService} from '../core/auth/auth.service';
import {take} from 'rxjs/operators';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PasswordValidation} from '../shared/functions/password-validator';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: '{{dashCase name}}-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {
  wrongToken = false;
  token: string;
  submitted = false;
  showPass = false;
  form: FormGroup = this.fb.group({
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required]
  }, {
    validator: PasswordValidation.MatchPassword
  });

  constructor(private fb: FormBuilder,
              private activatedRoute: ActivatedRoute,
              private authService: AuthService,
              private snackBar: MatSnackBar,
              private router: Router) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      if (params['token']) {
        this.authService.validateToken(params['token'])
          .pipe(take(1))
          .subscribe(() => {
            this.token = params['token'];
          }, err => this.wrongToken = true);
      } else {
        this.wrongToken = true;
      }
    })
  }

  reset() {
    this.authService.resetPassword(this.token, this.form.get('password').value, this.form.get('confirmPassword').value)
      .pipe(take(1))
      .subscribe(() => {
        this.snackBar.open('Your password was reset, please login with your new password', 'Okay', {
          duration: 3000
        });
        this.router.navigate(['/login'])
      })
  }
}
