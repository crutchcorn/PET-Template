import {NgModule} from '@angular/core';

import {PostsRoutingModule, postsRoutedComponents} from './posts-routing.module';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    PostsRoutingModule
  ],
  declarations: [postsRoutedComponents],
  exports: [postsRoutedComponents]
})
export class PostsModule {
}
