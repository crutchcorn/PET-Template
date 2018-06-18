import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {DashboardComponent} from '../dashboard/dashboard.component';
import {NavShellComponent} from './nav-shell.component';
import {LoginComponent} from '../login/login.component';

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
        path: 'posts',
        loadChildren: '../posts/posts.module#PostsModule'
      }
    ]
  },
];

export const navShellRoutedComponents = [
  NavShellComponent,
  DashboardComponent,
  LoginComponent
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NavShellRoutingModule {
}
