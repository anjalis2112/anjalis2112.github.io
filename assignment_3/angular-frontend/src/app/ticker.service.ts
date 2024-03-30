import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';

interface News {
  source: any;
  publishedDate: any;
  title: any;
  description: any;
  url: any;
  image: any;
  datetime: any;
  headline: any;
  summary: any;
}

interface NewsList {
  news: News[];
}

interface InsiderData {
  symbol: string;
  year: number;
  month: number;
  change: number;
  mspr: number;
}

@Injectable({
  providedIn: 'root'
})
export class TickerService {
  ticker: string | null = null;
  companyName: any = null;
  companyLogo: any = null;
  exchangeCode: any = null;
  lastPrice: any = null;
  change: any = null;
  changePercent: any = null;
  currentTimestamp: any = null;
  quoteTimestamp: any = null;
  marketStatus: any = null;
  highPrice: any = null;
  lowPrice: any = null;
  openPrice: any = null;
  prevClosePrice: any = null;
  timestamp: any = null;
  ipoStartDate: any = null;
  industry: any = null;
  webpage: any = null;
  companyPeers: any = null;

  private newsSubject = new BehaviorSubject<NewsList | undefined>(undefined);
  news$: Observable<NewsList | undefined> = this.newsSubject.asObservable();
  news: NewsList | undefined = undefined;
  totalMSPR: any = null;
  positiveMSPR: any = null;
  negativeMSPR: any = null;
  totalChange: any = null;
  positiveChange: any = null;
  negativeChange: any = null;
  view: string = '';


  // Hourly chart data
  lineColor: any = null;
  hourlyData: any = null;
  hourlyOptions: any = null;

  // Chart Data
  historicalData: any = null;

  // Insights
  trendsData: any = null;
  surpriseData: any = null;

  private tickerSubject = new BehaviorSubject<string | null>(null);
  ticker$ = this.tickerSubject.asObservable();

  constructor(private apiService: ApiService) {
  }

  setTicker(ticker: string) {
    this.ticker = ticker; // Set the ticker property
    this.tickerSubject.next(ticker);
    console.log('Ticker set:', ticker);
  }

  clearTicker() {
    this.ticker = ''; // Clear the ticker property
    this.tickerSubject.next(''); // Update the ticker subject
  }

  setNews(news: NewsList) {
    this.news = news;
    this.newsSubject.next(news);
  }

  private filterPeers(peers: string[]): string[] {
    return peers.filter(peer => !peer.includes('.'));
  }

  fetchData(): Observable<any> {
    if (!this.ticker) {
      return throwError("Ticker is not set");
    }
    return forkJoin([
      this.apiService.getProfileData(this.ticker),
      this.apiService.getQuoteData(this.ticker),
      this.apiService.getNewsData(this.ticker),
      this.apiService.getInsiderData(this.ticker),
      this.apiService.getTrendsData(this.ticker),
      this.apiService.getEarningsData(this.ticker),
      this.apiService.getPeersData(this.ticker),
      this.apiService.getHistoricalData(this.ticker),
      this.apiService.getHourlyData(this.ticker)
    ]).pipe(
      tap(([profileData, quoteData, newsData, insiderData, trendsData, earningsData, peersData, historicalData, hourlyData]) => {
        // Update properties with fetched data
        this.companyName = profileData.name;
        this.companyLogo = profileData.logo;
        this.exchangeCode = profileData.exchange;
        this.ipoStartDate = profileData.ipo;
        this.industry = profileData.finnhubIndustry;
        this.webpage = profileData.weburl;

        this.lastPrice = quoteData.c;
        this.change = quoteData.d;
        this.changePercent = quoteData.dp;
        this.timestamp = new Date(quoteData.t * 1000);
        this.highPrice = quoteData.h;
        this.lowPrice = quoteData.l;
        this.openPrice = quoteData.o;
        this.prevClosePrice = quoteData.pc;


        const filteredNews = newsData
          .filter((item: any) => item.image !== null && item.title !== null && item.image !== "" && item.title !== "")
          .map((item: any) => ({
            source: item.source,
            publishedDate: item.datetime,
            title: item.headline,
            description: item.summary,
            url: item.url,
            image: item.image,
            datetime: item.datetime,
            headline: item.headline,
            summary: item.summary
          }))
          .slice(0, 20); // Keep only the first 20 items
        const newsList: NewsList = { news: filteredNews };
        this.setNews(newsList);

        // Update insider data
        let totalMSPR = 0;
        let positiveMSPR = 0;
        let negativeMSPR = 0;
        insiderData.data.forEach((data: InsiderData) => {
          totalMSPR += data.mspr;
          if (data.mspr > 0) {
            positiveMSPR += data.mspr;
          } else {
            negativeMSPR += data.mspr;
          }
        });
        this.totalMSPR = totalMSPR;
        this.positiveMSPR = positiveMSPR;
        this.negativeMSPR = negativeMSPR;

        let totalChange = 0;
        let positiveChange = 0;
        let negativeChange = 0;
        insiderData.data.forEach((data: InsiderData) => {
          totalChange += data.change;
          if (data.change > 0) {
            positiveChange += data.change;
          } else {
            negativeChange += data.change;
          }
        });
        this.totalChange = totalChange;
        this.positiveChange = positiveChange;
        this.negativeChange = negativeChange;

        // Update trends data
        this.trendsData = trendsData;

        // Update earnings data
        this.surpriseData = earningsData;

        // Update peers data
        this.companyPeers = this.filterPeers(peersData);

        // Update historical data
        this.historicalData = historicalData;

        // Update hourly data
        this.hourlyData = hourlyData;
      })
    );
  }
}
