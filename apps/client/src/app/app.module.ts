import {
  provideHttpClient,
  withInterceptors,
  withXhr,
} from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NotificationComponent } from './components/containers/notification/notification.component';
import { errorInterceptor } from './interceptors/error.interceptor';
import { headerInterceptor } from './interceptors/header.interceptor';
import { ContainerComponent } from './layouts/container/container.component';

@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ContainerComponent,
    NotificationComponent,
  ],
  providers: [
    provideHttpClient(
      withXhr(),
      withInterceptors([headerInterceptor, errorInterceptor]),
    ),
  ],
})
export class AppModule {}
