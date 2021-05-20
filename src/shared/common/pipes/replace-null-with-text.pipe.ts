import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'replaceNullOrEmptyWithText'
  })
  export class ReplaceNullOrEmptyWithTextPipe implements PipeTransform {
  
    transform(value: any, replaceText: string = '-'): any {
      if (typeof value === 'undefined' || value === null || value === '') {
        return replaceText;
      }
  
      return value;
    }
  
  }