import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';

import {NavShellRoutingModule, navShellRoutedComponents} from './nav-shell-routing.module';

@NgModule({
  imports: [
    SharedModule,
    NavShellRoutingModule
  ],
  declarations: [navShellRoutedComponents],
  exports: [navShellRoutedComponents]
})
export class NavShellModule {
}
