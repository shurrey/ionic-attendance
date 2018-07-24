import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AttendancePage } from '../attendance/attendance';
import { AppHelper } from '../helper/helper';
import { Storage } from '@ionic/storage';
import * as $ from 'jquery';

@Component({
  selector: 'page-course-list',
  templateUrl: 'course-list.html'
})

export class CourseListPage {

  items: Array<{title: string, note: string, icon: string}>;

  constructor(public navCtrl: NavController, private storage: Storage, private helper: AppHelper) {
    this.items = [];
  }

  ngAfterViewInit() {

    let _this = this;
	let token = null;

    $(document).ready(function () {
		_this.storage.get('config').then(config => {
			_this.helper.callAjax(config.url + '/learn/api/public/v1/oauth2/token?grant_type=client_credentials',
				'Basic ' + btoa(config.client + ":" + config.secret),
				'POST',
				function (data) {
					token = data.access_token;
					_this.helper.callAjax(config.url + '/learn/api/public/v1/users/userName:' + config.user + '/courses',
						'Bearer ' + token,
						'GET',
						function (data) {
							data.results.forEach(course => {
								if (course.courseRoleId == 'Instructor' && course.availability.available == 'Yes') {
								  _this.helper.callAjax(config.url + '/learn/api/public/v1/courses/' + course.courseId,
								  'Bearer ' + token,
								  'GET',
								  function (data) {
									  _this.items.push({
										title: data.name,
										note: data.courseId
									  });
								  });
								}
							});
						}
					);
				}
			);
		});
    });
  }

  itemTapped(event, item) {
    this.navCtrl.push(AttendancePage, {
      item: item
    });
  }
}