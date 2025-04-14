import { NgModule } from '@angular/core';
import {
  BrowserModule,
  provideClientHydration,
} from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { OrderDetailsComponent } from './order-details/order-details.component';
@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, FormsModule, OrderDetailsComponent],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideClientHydration(),
  ],
})
export class AppModule {}
