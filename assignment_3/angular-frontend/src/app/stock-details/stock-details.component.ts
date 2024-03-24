import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { TickerService } from '../ticker.service';
import { CommonModule } from '@angular/common';  
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

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

@Component({
    standalone: true,
    selector: 'app-stock-details',
    templateUrl: './stock-details.component.html',
    styleUrls: ['./stock-details.component.css'],
    imports: [CommonModule, RouterModule, HttpClientModule, NgbModule]
})
export class StockDetailsComponent implements OnInit {

    ticker: any;
    companyName: any;
    companyLogo: any;
    exchangeCode: any;
    lastPrice: any;
    change: any;
    changePercent: any;
    currentTimestamp: any;
    marketStatus: any;
    highPrice: any;
    lowPrice: any;
    openPrice: any;
    prevClosePrice: any;
    timestamp: any;
    ipoStartDate: any;
    industry: any;
    webpage: any;
    companyPeers: any;
    news: NewsList | undefined;
    totalMSPR: any;
    positiveMSPR: any;
    negativeMSPR: any;
    totalChange: any;
    positiveChange: any;
    negativeChange: any;
    view: string = '';

    constructor(private apiService: ApiService, private tickerService: TickerService) { }

    ngOnInit(): void {
        this.showSummary();
        this.tickerService.ticker$.subscribe(ticker => {
            this.ticker = ticker;
            // Use the ticker value for further processing

            // Fetching profile data
            this.apiService.getProfileData(this.ticker).subscribe((profileData: any) => {
                this.companyName = profileData.name;
                this.companyLogo = profileData.logo;
                this.exchangeCode = profileData.exchange;
                this.ipoStartDate = profileData.ipo;
                this.industry = profileData.finnhubIndustry;
                this.webpage = profileData.weburl;
                // Assign other properties similarly
            });

            // Fetching quote data
            this.apiService.getQuoteData(this.ticker).subscribe((quoteData: any) => {
                this.lastPrice = quoteData.c;
                this.change = quoteData.d;
                this.changePercent = quoteData.dp;
                this.currentTimestamp = quoteData.t;
                this.highPrice = quoteData.h;
                this.lowPrice = quoteData.l;
                this.openPrice = quoteData.o;
                this.prevClosePrice = quoteData.pc;
                // Assign other properties similarly
            });

            // Fetching news data
            this.apiService.getNewsData(this.ticker).subscribe((newsData: any) => {
                // Filter and map the news items
                const filteredNews = newsData
                    .filter((item: any) => item.headline && item.image) // Filter only items with both title and image
                    .map((item: any) => ({
                        source: item.source,
                        publishedDate: item.datetime,
                        title: item.headline,
                        description: item.summary,
                        url: item.url,
                        image: item.image
                    }));

                // Assign the filtered and mapped data to the news property
                this.news = { news: filteredNews };
                console.log('Filtered News:', filteredNews);
            });

            // Fetching insider data
            this.apiService.getInsiderData(this.ticker).subscribe((insiderData: any) => {
                this.totalMSPR = insiderData.totalMSPR;
                this.positiveMSPR = insiderData.positiveMSPR;
                this.negativeMSPR = insiderData.negativeMSPR;
                this.totalChange = insiderData.totalChange;
                this.positiveChange = insiderData.positiveChange;
                this.negativeChange = insiderData.negativeChange;
                // Assign other properties similarly
            });
            
            // Fetching peers data
            this.apiService.getPeersData(this.ticker).subscribe((peersData: any) => {
                this.companyPeers = peersData; // Assuming the response structure matches your peers data
            });
        });
    }

    showSummary() {
        this.view = 'summary';
    }

    // Method to show top news view
    showTopNews() {
        this.view = 'topNews';
    }

    // Method to show charts view
    showCharts() {
        this.view = 'charts';
    }

    // Method to show insights view
    showInsights() {
        this.view = 'insights';
    }

}
