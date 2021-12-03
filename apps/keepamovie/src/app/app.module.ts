import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Route, Router, RouterModule } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DialogModule } from './shared/dialog/dialog.module';
import { AuthGuard } from './state/auth.guard';
import { HotToastModule } from '@ngneat/hot-toast';
import { AkitaNgRouterStoreModule } from '@datorama/akita-ng-router-store';
import * as Sentry from '@sentry/angular';
import { ButtonModule } from './shared/button/button.module';
import { SvgIconsModule } from '@ngneat/svg-icon';
import { akitaConfig } from '@datorama/akita';
import { appStarIcon } from './svg/star';
import { appLoadingIcon } from './svg/loading';
import { appPlusIcon } from './svg/plus';
import { appCloseIcon } from './svg/close';
import { appLogoutIcon } from './svg/logout';
import { appMenuIcon } from './svg/menu';
import { appSearchIcon } from './svg/search';
import { appTrashIcon } from './svg/trash';

akitaConfig({ resettable: true });

const routes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'home',
    canActivate: [AuthGuard],
    component: HomeComponent,
    children: [
      {
        path: 'movies-lists',
        loadChildren: () =>
          import('./movies-lists/movies-lists.module').then((m) => m.MoviesListsModule)
      },
      // Until there is a home page, redirect to  movies lists
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'movies-lists'
      }
    ]
  }
];

@NgModule({
  declarations: [AppComponent, LoginComponent, RegisterComponent, HomeComponent],
  imports: [
    CoreModule,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    AkitaNgRouterStoreModule,
    ButtonModule,
    RouterModule.forRoot(routes, {
      initialNavigation: 'enabled',
      relativeLinkResolution: 'legacy',
      scrollPositionRestoration: 'top'
    }),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerImmediately'
    }),
    HotToastModule.forRoot(),
    SvgIconsModule.forRoot({
      icons: [
        appPlusIcon,
        appCloseIcon,
        appStarIcon,
        appLogoutIcon,
        appTrashIcon,
        appLoadingIcon,
        appSearchIcon,
        appMenuIcon
      ]
    })
  ],
  providers: [
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler()
    },
    {
      provide: Sentry.TraceService,
      deps: [Router]
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {
        /* do stuff here for tracing if needed */
      },
      deps: [Sentry.TraceService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
