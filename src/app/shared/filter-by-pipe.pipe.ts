import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'filterBy',
  pure: false
})
export class FilterByPipe implements PipeTransform {
  transform(array: any[], filter: any): any {
    // console.log(array);
    console.log(filter);
    return array.filter(item => {
      if (typeof filter === 'object') {
          for (const key in item) {
            if (!filter.hasOwnProperty(key)) {
              continue;
            }
            if (item[key].toString().toLowerCase().indexOf(filter[key]) >= 0) {
              return true;
            }
          }
          return false;
      }else if (typeof filter === 'string') {
        for (const key in item) {
          if (typeof(item[key]) === 'string' && item[key].toLowerCase().indexOf(filter) >= 0) {
            return true;
          }
        }
        return false;
      }else {
        return false;
      }
    });
  }
}
