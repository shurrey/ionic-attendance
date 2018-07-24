import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { AppHelper } from '../helper/helper';
import * as $ from 'jquery';
import * as crypto from 'crypto';

@Component({
  selector: 'page-attendance',
  templateUrl: 'attendance.html'
})

export class AttendancePage {

  selectedCourse: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private storage: Storage, private helper: AppHelper) {
    this.selectedCourse = navParams.get('item');
  }
  
  ngAfterViewInit() {

	let _this = this;
	let token = null;
	let score = 100;

    $(document).ready(() => {
		_this.storage.get('config').then(config => {
			_this.helper.callAjax(config.url + '/learn/api/public/v1/oauth2/token?grant_type=client_credentials',
				'Basic ' + btoa(config.client + ":" + config.secret),
				'POST',
				data => {
					token = 'Bearer ' + data.access_token;
					_this.helper.callAjax(config.url + '/learn/api/public/v1/courses/courseId:' + _this.selectedCourse.note + '/gradebook/schemas',
						token,
						'GET',
						data => {
							let schema = data.results.find(value => value.scaleType == 'CompleteIncomplete');
							_this.helper.callAjax(config.url + '/learn/api/public/v2/courses/courseId:' + _this.selectedCourse.note + '/gradebook/columns',
								token,
								'GET',
								data => {
									let columnName = _this.getAttendanceColumnName();
									let column = data.results.find(value => value.name == columnName);
									if (column) {
										console.log('Column found in Gradebook: ' + column.id);
										loadAttendanceSheet(column.id);
										score = column.score.possible;
									} else {
										column = _this.createColumnObj(columnName, schema, score);
										_this.helper.callAjax(config.url + '/learn/api/public/v2/courses/courseId:' + _this.selectedCourse.note + '/gradebook/columns',
											token,
											'POST',
											data => {
												console.log('Created grade column ' + data.id);
												loadAttendanceSheet(data.id);
											},
											JSON.stringify(column)
										);
									}
								}
							);
						}
					);
				}
			);

			function loadAttendanceSheet(columnId) {
				console.log('Loading attendance sheet');
				_this.helper.callAjax(config.url + '/learn/api/public/v1/courses/courseId:' + _this.selectedCourse.note + '/users',
					token,
					'GET',
					data => {
						let container = $('.all-users');
						data.results.forEach(enroll => {
							if (enroll.courseRoleId == 'Student' && enroll.availability.available == 'Yes') {
								_this.helper.callAjax(config.url + '/learn/api/public/v1/users/' + enroll.userId,
									token,
									'GET',
									data => {
										if (data.availability.available == 'Yes' && !data.name.family.endsWith('_PreviewUser')) {
											_this.helper.callAjax(config.url + '/learn/api/public/v1/courses/courseId:' + _this.selectedCourse.note + '/gradebook/columns/' + columnId + '/users/' + enroll.userId,
												token,
												'GET',
												grade => {
													let userName = data.name.family + ' ' + data.name.given;
													let css = grade.score == score ? 'graded' : 'not-graded';
													let userIcon = $('<div>').addClass('user-container').addClass(css).data('user-id', data.id).data('column-id', columnId).text(userName);
													if (data.contact && data.contact.email) {
														let image = _this.getProfileImageUrl(data.contact.email);
														userIcon.prepend($('<img>').attr('src', image));
													}
													container.append(userIcon);
												}
											);
										}
									}
								);
							}
						});
					}
				);
			}

			$('.all-users').on('click', '.not-graded', function () {
				let student = $(this);
				let attempt = _this.createAttemptObj(student.data('user-id'), score);
				console.log('Taking attendance for user ' + student.text());
				_this.helper.callAjax(config.url + '/learn/api/public/v1/courses/courseId:' + _this.selectedCourse.note + '/gradebook/columns/' + student.data('column-id') + '/users/' + student.data('user-id'),
					token,
					'PATCH',
					response => {
						student.removeClass('not-graded').addClass('graded');
					},
					JSON.stringify(attempt)
				);
			}).on('click', '.graded', function () {
				let student = $(this);
				let attempt = _this.createAttemptObj(student.data('user-id'), 0);
				console.log('Removing attendance for user ' + student.text());
				_this.helper.callAjax(config.url + '/learn/api/public/v1/courses/courseId:' + _this.selectedCourse.note + '/gradebook/columns/' + student.data('column-id') + '/users/' + student.data('user-id'),
					token,
					'PATCH',
					response => {
						student.removeClass('graded').addClass('not-graded');
					},
					JSON.stringify(attempt)
				);
			});;
		});
    });
  }

  private createAttemptObj(userId, score) {
	return {
		userId: userId,
		score: score,
		text: score ? String(score) : '-',
		exempt: false
	}
  }

  private createColumnObj(columnName, schema, score) {
	return {
		name: columnName,
		displayName: columnName,
		availability: {
			available: 'Yes'
		},
		score: {
			possible: score
		},
		grading: {
			type: 'Manual',
			schemaId: schema.id
		}
	};
  }

  private getAttendanceColumnName() {
	let date = new Date();
	return 'Attendance ' + [ date.getDate(), date.getMonth() + 1, date.getFullYear() ].join('/');
  }

  private getProfileImageUrl(email) {
	let md5 = crypto.createHash('md5');
	return 'http://www.gravatar.com/avatar/' + md5.update(email).digest('hex') + '.jpg?s=40';
  }
}