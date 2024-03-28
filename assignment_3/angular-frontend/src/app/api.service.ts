import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'http://localhost:8080';
  readonly favorites = this.apiUrl +'/favorites/'
  readonly holdings = this.apiUrl +'/holdings/'

  constructor(private httpClient: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // client-side/network error
      console.error('An error occurred:', error.error);
    } else {
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    // user message
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }

  getAutoData(ticker: string, params?: HttpParams) {
    return this.httpClient.get<any>(`${this.apiUrl}/auto/${ticker}`, { params });
  }

  //TO USE FOR DESC 
  getProfileData(ticker: string, params?: HttpParams) {
    return this.httpClient.get<any>(`${this.apiUrl}/profile/${ticker}`, { params });
  }

  getHourlyData(ticker: string, params?: HttpParams) {
    return this.httpClient.get<any>(`${this.apiUrl}/hourly/${ticker}`, { params });
  }

  //TO USE
  getHistoricalData(ticker: string, params?: HttpParams) {
    return this.httpClient.get<any>(`${this.apiUrl}/history/${ticker}`, { params });
  }

  //LATEST QUOTE
  getQuoteData(ticker: string, params?: HttpParams) {
    return this.httpClient.get<any>(`${this.apiUrl}/quote/${ticker}`, { params });
  }

  //TO USE
  getNewsData(ticker: string, params?: HttpParams) {
    return this.httpClient.get<any>(`${this.apiUrl}/news/${ticker}`, { params });
  }
  

  getTrendsData(ticker: string, params?: HttpParams) {
    return this.httpClient.get<any>(`${this.apiUrl}/trends/${ticker}`, { params });
  }

  getInsiderData(ticker: string, params?: HttpParams) {
    return this.httpClient.get<any>(`${this.apiUrl}/insider/${ticker}`, { params });
  }

  //TO USE
  getPeersData(ticker: string, params?: HttpParams) {
    return this.httpClient.get<any>(`${this.apiUrl}/peers/${ticker}`, { params });
  }

  getEarningsData(ticker: string, params?: HttpParams) {
    return this.httpClient.get<any>(`${this.apiUrl}/earnings/${ticker}`, { params });
  }

  getFavorites(){
    return this.httpClient.get(this.favorites)
      .pipe(
        catchError(this.handleError)
      );
  }
  getHoldings(){
    return this.httpClient.get(this.holdings)
      .pipe(
        catchError(this.handleError)
      );
  }
  updateFavorites(ticker: string, name?: string){
    return this.httpClient.post(this.favorites, { ticker: ticker, name: name }) 
      .pipe(
        catchError(this.handleError)
      );
  }
  updateHoldings(ticker: string, quantity: number, cost: number){
    return this.httpClient.post(this.holdings, { ticker: ticker, quantity: quantity, cost: cost }) 
      .pipe(
        catchError(this.handleError)
      );
  }

}
