import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { AlertController } from 'ionic-angular';

@Component({
  selector: 'page-config',
  templateUrl: 'config.html'
})

export class ConfigPage {

  config = {
	url: null,
	client: null,
	secret: null,
	user: null
  };

  constructor(private storage: Storage, private alertCtrl: AlertController) {
	storage.get('config').then(config => {
	  if (config) {
	    this.config = config
	  } else {
	    console.log('Config not loaded')
	  }
    })
  }
  
  saveForm() {
	this.storage.set('config', this.config)
	console.log('Config saved')
	this.alertCtrl.create({
		title: 'Save Settings',
		subTitle: 'Your settings have been saved.',
		buttons: ['OK']
	}).present();
  }
}
