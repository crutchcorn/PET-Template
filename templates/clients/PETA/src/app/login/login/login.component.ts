import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../core/auth/auth.service';
import * as fromRoot from '../../core/reducers';
import * as userActions from '../../core/user/user.actions';
import {Store} from '@ngrx/store';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: '{{dashCase name}}-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private activeRoute: ActivatedRoute,
              private snackBar: MatSnackBar,
              private authService: AuthService,
              private router: Router) {
  }

  ngOnInit() {
    this.activeRoute.params.subscribe((params: Params) => {
      if (params['forced']) {
        this.snackBar.open('You\'ve been forcably logged out. ' +
          'Please log back in to be redirected back to where you were', 'Confirm')
      }
    })
  }

  login() {
    this.authService.login('test', 'test')
      .subscribe(user => {
        // Please keep in mind that if the user has a redirect URL, the auth interceptor
        // will redirect them to that URL and not to the `posts` section
        this.router.navigate(['/posts']);
      });
  }
}
