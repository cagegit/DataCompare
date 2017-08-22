import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'sqlType'})
export class SqlTypePipe implements PipeTransform {
  transform(value: string | number): any {
    value = value + '';
    if (!value) {
      return value
    }
    if (value === '1') {
      return 'mysql';
    } else if (value === '2') {
      return 'oracle10g/11g';
    } else if (value === '4') {
      return 'oracle9i';
    }else {
      return value;
    }
  }
}
