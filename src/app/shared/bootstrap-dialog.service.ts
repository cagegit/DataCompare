import { Injectable } from '@angular/core';
declare let BootstrapDialog: any;
@Injectable()
export class BootstrapDialogService {

  constructor() { }
  confirm(model: object) {
    BootstrapDialog.confirm(model);
  }
  alert(model: object) {
    BootstrapDialog.alert(model);
  }
  show(model: object) {
    BootstrapDialog.alert(model);
  }
}
