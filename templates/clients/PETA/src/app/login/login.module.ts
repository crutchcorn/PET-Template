import {NgModule} from '@angular/core';

import {LoginRoutingModule, loginRoutedComponents} from './login-routing.module';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    LoginRoutingModule
  ],
  declarations: [loginRoutedComponents],
  exports: [loginRoutedComponents]
})
export class LoginModule {
}
