import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Country {
    name: string;
    code: string;
    phone_code: string;
  }

@Injectable({
  providedIn: 'root',
})
export class CountriesService {

    protected readonly baseUrl: string = 'assets/';
    protected readonly filename: string = 'countries.json';
    protected data : Country[] = null;

    constructor(private http: HttpClient) {
        this.loadData().subscribe(result => 
            { 
                this.data = result; 
            });
      }

    public getCountries(): Country[] {
        return this.data;
      }

    public getCode(n : string): string
    {
        const index = this.data.find( ({name}) => name === n);
        return index.code;
    }

    public getName(c : string): string
    {
        return this.data.find( ({code}) => code === c).name;
    }
    
      public loadData(): Observable<Country[]> {

        if(this.data != null)
        {
            const observable = new Observable<Country[]>(observer => {
                observer.next(this.data);
            });

            return observable;
        }

        return this.http.get<Country[]>(this.baseUrl + this.filename);
      }
}