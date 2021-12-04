import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools';
import { environment } from '../../environments/environment';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';

@NgModule({
  declarations: [],
  imports: [
    provideAuth(() => getAuth()),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    environment.production ? [] : AkitaNgDevtools.forRoot(),
    HttpClientModule
  ]
})
export class CoreModule {}
