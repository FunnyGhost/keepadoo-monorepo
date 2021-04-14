import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Route, RouterModule } from '@angular/router';
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
import { SvgIconsModule } from '@ngneat/svg-icon';
import { appPlusIcon } from './svg/plus';
import { appCloseIcon } from './svg/close';
import { appStarIcon } from '@app/svg/star';
import { appLogoutIcon } from '@app/svg/logout';
import { appTrashIcon } from '@app/svg/trash';
import { appLoadingIcon } from '@app/svg/loading';
import { appSearchIcon } from '@app/svg/search';
import { appMenuIcon } from '@app/svg/menu';
import { AkitaNgRouterStoreModule } from '@datorama/akita-ng-router-store';

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
    RouterModule.forRoot(routes, {
      initialNavigation: 'enabled',
      relativeLinkResolution: 'legacy'
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
  bootstrap: [AppComponent]
})
export class AppModule {}
