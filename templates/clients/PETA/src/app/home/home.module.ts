import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';

import {HomeRoutingModule, homeRoutedComponents} from './home-routing.module';

@NgModule({
  imports: [
    SharedModule,
    HomeRoutingModule
  ],
  declarations: [homeRoutedComponents],
  exports: [homeRoutedComponents]
})
export class HomeModule {
}
