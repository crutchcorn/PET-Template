import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {PostsComponent} from './posts.component';
import {PostsListComponent} from './posts-list/posts-list.component';
import {AuthGuard} from '../core/auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: PostsComponent,
    canActivateChild: [AuthGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: PostsListComponent,
        data: {
          title: 'Post List'
        }
      }
    ]
  }
];

export const postsRoutedComponents = [
  PostsComponent,
  PostsListComponent
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PostsRoutingModule { }
