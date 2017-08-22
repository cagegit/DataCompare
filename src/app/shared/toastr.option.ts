import { Injectable } from '@angular/core';
import { ToastOptions } from 'ng2-toastr';

@Injectable()
export class CustomOption extends ToastOptions {
  animate = 'fade'; // you can override any options available
  newestOnTop = false;
  showCloseButton = true;
  // positionClass= 'toast-top-center';
  toastLife = 3000;
}
export const customOptionProvider = {provide: ToastOptions, useClass: CustomOption};
