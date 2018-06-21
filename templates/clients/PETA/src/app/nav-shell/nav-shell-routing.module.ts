import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {DashboardComponent} from '../dashboard/dashboard.component';
import {NavShellComponent} from './nav-shell.component';
import {LoginComponent} from '../login/login.component';
import {SignupComponent} from '../signup/signup.component';
import {PasswordResetComponent} from '../password-reset/password-reset.component';

const routes: Routes = [
  {
    path: '',
    component: NavShellComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: DashboardComponent,
        data: {
          title: '{{titleCase name}} Dashboard'
        }
      },
      {
        path: 'login',
        component: LoginComponent,
        data: {
          title: 'Login'
        }
      },
      {
        path: 'signup',
        component: SignupComponent,
        data: {
          title: 'Signup'
        }
      },
      {
        path: 'reset-password/:token',
        component: PasswordResetComponent,
        data: {
          title: 'Reset Password'
        }
      },
      {
        path: 'posts',
        loadChildren: '../posts/posts.module#PostsModule'
      }
    ]
  },
];

export const navShellRoutedComponents = [
  NavShellComponent,
  DashboardComponent,
  LoginComponent,
  SignupComponent,
  PasswordResetComponent
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NavShellRoutingModule {
}
