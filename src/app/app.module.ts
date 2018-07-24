import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { AttendanceApp } from './app.component';
import { AppHelper } from '../pages/helper/helper';
import { HomePage } from '../pages/home/home';
import { AttendancePage } from '../pages/attendance/attendance';
import { CourseListPage } from '../pages/course-list/course-list';
import { ConfigPage } from '../pages/config/config';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

@NgModule({
  declarations: [
    AttendanceApp,
    HomePage,
    AttendancePage,
    CourseListPage,
	ConfigPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(AttendanceApp),
	IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    AttendanceApp,
    HomePage,
    AttendancePage,
    CourseListPage,
	ConfigPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
	AppHelper,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
