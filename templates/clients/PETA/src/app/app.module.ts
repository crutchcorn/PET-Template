import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';

import {MatDialogModule, MatButtonModule} from '@angular/material';
import {A11yModule} from '@angular/cdk/a11y';

import {CoreModule} from './core/core.module';
import {AppRoutingModule} from './app-routing.module';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';

import {AppComponent, StayLoggedInDialogComponent} from './app.component';

@NgModule({
  declarations: [
    AppComponent,
    StayLoggedInDialogComponent
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
    environment.production ? ServiceWorkerModule.register('/ngsw-worker.js') : []
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [StayLoggedInDialogComponent]
})
export class AppModule {
}
