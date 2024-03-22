import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'http://localhost:8080';
  autcompleteURL: string = '/company-autocomplete';
  descriptionURL: string = '/company-description';
  stockQuoteURL: string = '/company-stock-quote';
  peersURL: string = '/company-peers';
  newsURL: string = '/company-news';

  constructor(private httpClient: HttpClient) { }

  getAutoData(ticker: string, params?: HttpParams) {
    return this.httpClient.get<any>(`${this.apiUrl}/auto/${ticker}`, { params });
  }
}
