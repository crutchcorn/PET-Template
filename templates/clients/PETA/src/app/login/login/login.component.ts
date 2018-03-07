import {Component} from '@angular/core';
import {AuthService} from '../../core/auth/auth.service';
import * as fromRoot from '../../core/reducers';
import * as userActions from '../../core/user/user.actions';
import {Store} from '@ngrx/store';
import {Router} from '@angular/router';

@Component({
  selector: '{{dashCase projectName}}-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  constructor(private authService: AuthService,
              private router: Router) {
  }

  login() {
    this.authService.login('test', 'test')
      .subscribe(user => {
        this.router.navigate(['/posts']);
      });
  }
}
