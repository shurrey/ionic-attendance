import { Injectable } from '@angular/core';
import * as $ from 'jquery';

@Injectable()
export class AppHelper {

  public callAjax(url, auth, method, success, data?) {
	let obj = {
		type: method,
		url: url,
		contentType: 'application/x-www-form-urlencoded',
		beforeSend: function (xhr) {
			xhr.setRequestHeader("Authorization", auth);
		},
		success: function (data) {
			success(data);
		},
		error: function (xhr, ajaxOptions, thrownError) {
			console.log(xhr, ajaxOptions, thrownError);
		}
	};
	if (data) {
		obj.data = data;
		obj.dataType = 'json';
		obj.contentType = 'application/json';
	}
    $.ajax(obj);
  }
}