import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service'; // Import ApiService here

interface News {
  source: any;
  publishedDate: any;
  title: any;
  description: any;
  url: any;
  image: any;
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
  ticker: any = null;
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
  news: NewsList | undefined = undefined;
  totalMSPR: any = null;
  positiveMSPR: any = null;
  negativeMSPR: any = null;
  totalChange: any = null;
  positiveChange: any = null;
  negativeChange: any = null;
  view: string = '';
  marketClosed: boolean = false;

  // Hourly chart data
  lineColor: any = null;
  hourlyData: any = null;
  hourlyOptions: any = null;

  // Chart Data
  historicalData: any = null;
  chartTabData: any = null;
  chartTabOptions: any = null;

  // Insights
  trendsData: any = null;
  surpriseData: any = null;
  recommendOptions: any = null;
  surpriseOptions: any = null;

  private tickerSubject = new BehaviorSubject<string | null>(null);
  ticker$ = this.tickerSubject.asObservable();

  constructor(private apiService: ApiService) {
    // Fetch data when service is instantiated
    this.ticker$.subscribe(ticker => {
      if (ticker) {
        this.fetchData();
      }
    });
  }

  setTicker(ticker: string) {
    this.tickerSubject.next(ticker);
  }

  private fetchData() {
    this.apiService.getProfileData(this.ticker).subscribe((profileData: any) => {
      this.companyName = profileData.name;
      this.companyLogo = profileData.logo;
      this.exchangeCode = profileData.exchange;
      this.ipoStartDate = profileData.ipo;
      this.industry = profileData.finnhubIndustry;
      this.webpage = profileData.weburl;
    });

    // Fetch quote data
    this.apiService.getQuoteData(this.ticker).subscribe((quoteData: any) => {
      this.lastPrice = quoteData.c;
      this.change = quoteData.d;
      this.changePercent = quoteData.dp;
      this.timestamp = new Date(quoteData.t * 1000);
      this.highPrice = quoteData.h;
      this.lowPrice = quoteData.l;
      this.openPrice = quoteData.o;
      this.prevClosePrice = quoteData.pc;

      setInterval(() => {
        const currentTime = new Date().getTime();
        const difference = (currentTime - this.timestamp.getTime()) / (1000 * 60); // Difference in minutes
        this.marketClosed = difference >= 5; // Set marketClosed flag based on difference
      }, 1000);
    });

    // Fetch news data
    this.apiService.getNewsData(this.ticker).subscribe((newsData: any) => {
      const filteredNews = newsData
        .filter((item: any) => item.image !== null && item.title !== null && item.image !== "" && item.title !== "")
        .map((item: any) => ({
          source: item.source,
          publishedDate: item.datetime,
          title: item.headline,
          description: item.summary,
          url: item.url,
          image: item.image
        }))
        .slice(0, 20); // Keep only the first 20 items
      this.news = { news: filteredNews };
    });

    // Fetch insider data
    this.apiService.getInsiderData(this.ticker).subscribe((insiderData: any) => {
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
    });

    // Fetch trends data
    this.apiService.getTrendsData(this.ticker).subscribe((trendsData: any) => {
      this.trendsData = trendsData;
      // Assign trends data
    });

    // Fetch earnings data
    this.apiService.getEarningsData(this.ticker).subscribe((surpriseData: any) => {
      this.surpriseData = surpriseData.earnings;
      // Assign earnings data
    });

    // Fetch peers data
    this.apiService.getPeersData(this.ticker).subscribe((peersData: any) => {
      this.companyPeers = peersData; // Assuming the response structure matches your peers data
    });

    // Fetch historical data
    this.apiService.getHistoricalData(this.ticker).subscribe((historicalData: any) => {
      this.historicalData = historicalData;
      // Assign historical data
    });

    // Fetch hourly data
    this.apiService.getHourlyData(this.ticker).subscribe((hourlyData: any) => {
      this.hourlyData = hourlyData;
      // Assign hourly data
    });
  }
}
