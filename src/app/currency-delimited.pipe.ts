import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'currencyDelimitedWithComma'})
export class CurrencyDelimitedWithCommaPipe implements PipeTransform {
  transform(value, args: string[]): any {
    console.log(value);
    let result = value;
    if (value === undefined || value === null) {
      return 0;
    }
    if (!value) {
        return value;
    } else if( Math.abs(value) > 100000000000000) {
        value = value / 1000000000000;
        value = value.toFixed(2);
        result = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' T';
    } else if( Math.abs(value) > 100000000000) {
        value = value / 1000000000;
        value = value.toFixed(2);
        result = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' B';
    } else if( Math.abs(value) > 100000000) {
        value = value / 1000000;
        value = value.toFixed(2);
        result = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' M';
    } else {
        const numberWithComma =  (parseInt(value)).toFixed(0);
        result = numberWithComma.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    console.log(result);
    return result;
  }
}
