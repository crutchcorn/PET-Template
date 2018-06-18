import {Component} from '@angular/core';
import {AuthService} from '../core/auth/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {MatSnackBar} from '@angular/material';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../core/user/user.service';
import {PasswordValidation} from '../shared/functions/password-validator';

@Component({
  selector: '{{dashCase name}}-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  submitted = false;
  showPass = false;
  form: FormGroup = this.fb.group({
    firstName: null,
    lastName: null,
    email: [null, [Validators.required, Validators.email]],
    username: [null, Validators.required],
    password: [null, Validators.required],
    confirmPassword: [null, Validators.required],
  }, {
    validator: PasswordValidation.MatchPassword
  });

  constructor(private activeRoute: ActivatedRoute,
              private snackBar: MatSnackBar,
              private authService: AuthService,
              private userService: UserService,
              private router: Router,
              private fb: FormBuilder) {
  }

  signup() {
    if (this.form.valid) {
      this.authService.signup(this.form.value)
        .subscribe(() => {
          // Please keep in mind that if the user has a redirect URL, the auth interceptor
          // will redirect them to that URL and not to the `posts` section
          this.router.navigate(['/posts']);
          // TODO: Do more to differenciate between telling user if no account or not
        });
    } else {
      this.submitted = true;
    }
  }
}
