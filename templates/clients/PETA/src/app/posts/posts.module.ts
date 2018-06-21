import {NgModule} from '@angular/core';

import {PostsRoutingModule, postsRoutedComponents} from './posts-routing.module';
import {SharedModule} from '../shared/shared.module';
import { PostsCreateComponent } from './posts-create/posts-create.component';

@NgModule({
  imports: [
    SharedModule,
    PostsRoutingModule
  ],
  declarations: [postsRoutedComponents, PostsCreateComponent],
  exports: [postsRoutedComponents]
})
export class PostsModule {
}
