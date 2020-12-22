import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Language {
    name: string;
    code: string;
    nativeName: string;
  }

@Injectable({
  providedIn: 'root',
})
export class LanguagesService {

    protected readonly baseUrl: string = 'assets/';
    protected readonly filename: string = 'languages.json';
    protected data : Language[] = null;

    constructor(private http: HttpClient) {
        this.loadData().subscribe(result => 
            { 
                this.data = result; 
            });
      }

    public getCode(name : string): string
    {
        for(var i = 0; i < this.data.length; i++)
        {
            if(this.data[i].name == name)
                return this.data[i].code;
        }

        return '';
    }

    public getName(code : string): string
    {
        for(var i = 0; i < this.data.length; i++)
        {
            if(this.data[i].code == code)
                return this.data[i].name;
        }

        return '';
    }

    
      public loadData(): Observable<Language[]> {

        if(this.data != null)
        {
            const observable = new Observable<Language[]>(observer => {
                observer.next(this.data);
            });

            return observable;
        }

        return this.http.get<Language[]>(this.baseUrl + this.filename);
      }
}