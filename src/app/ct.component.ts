/**
 * Created by cagej on 2017/6/23.
 */
import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ct',
  template: `
    <h1>Welcome to Angular World</h1>
    <p #greet>Hello {{ name }}</p>
  `,
})

export class CtComponent implements AfterViewInit {

  name= 'Semlinker';

  @ViewChild('greet')
  greetDiv: ElementRef;

  ngAfterViewInit() {
    console.dir(this.greetDiv);
  }
}
