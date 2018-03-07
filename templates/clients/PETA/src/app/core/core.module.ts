import {NgModule, Optional, SkipSelf} from '@angular/core';

import {StoreModule} from '@ngrx/store';
import {reducers, metaReducers} from './reducers';

/* Guards */
import {AuthGuard} from './auth/auth.guard';

/* Services */
import {AuthService} from './auth/auth.service';
import {PostService} from './post/post.service';
import {TimeoutService} from './timeout/timeout.service';

/* Interceptors */
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {AuthInterceptor} from './auth/auth.interceptor';
import {TimeoutInterceptor} from './timeout/timeout.interceptor';
import {UserService} from './user/user.service';

@NgModule({
  imports: [
    StoreModule.forRoot(reducers, {metaReducers}),
  ],
  exports: [],
  declarations: [],
  providers: [
    AuthService,
    PostService,
    AuthGuard,
    TimeoutService,
    UserService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TimeoutInterceptor,
      multi: true
    }
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(`CoreModule has already been loaded. Import Core modules in the AppModule only.`);
    }
  }
}
