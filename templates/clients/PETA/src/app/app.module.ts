import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';

import {MatDialogModule, MatButtonModule, MatToolbarModule, MatSidenavModule, MatIconModule, MatListModule} from '@angular/material';
import {A11yModule} from '@angular/cdk/a11y';

import {CoreModule} from './core/core.module';
import {AppRoutingModule} from './app-routing.module';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';

import {AppComponent, StayLoggedInDialogComponent} from './app.component';
import { LayoutModule } from '@angular/cdk/layout';

@NgModule({
  declarations: [
    AppComponent,
    StayLoggedInDialogComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    CoreModule,
    AppRoutingModule,
    MatDialogModule,
    A11yModule,
    MatButtonModule,
    environment.production ? ServiceWorkerModule.register('/ngsw-worker.js') : [],
    LayoutModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [StayLoggedInDialogComponent]
})
export class AppModule {
}
