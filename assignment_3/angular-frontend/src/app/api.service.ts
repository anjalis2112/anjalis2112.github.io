import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'http://localhost:8080';

  constructor(private httpClient: HttpClient) { }

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

}
