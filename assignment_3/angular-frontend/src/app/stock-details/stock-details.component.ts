import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { TickerService } from '../ticker.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts/highstock';
import indicators from 'highcharts/indicators/indicators';
import vbp from 'highcharts/indicators/volume-by-price';

indicators(Highcharts);
vbp(Highcharts);

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
    imports: [CommonModule, RouterModule, HttpClientModule, NgbModule, HighchartsChartModule],
    providers: [DatePipe]
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
    quoteTimestamp: any;
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
    marketClosed: boolean = false;

    //hourly chart data
    lineColor: any;
    hourlyData: any;
    hourlyCharts: typeof Highcharts = Highcharts;
    hourlyConstructor = "stockChart";
    hourlyOptions: any;

    //chart Data
    historicalData: any;
    chartTabData: any;
    chartTab: typeof Highcharts = Highcharts;
    chartTabOptions: any;
    chartTabConstructor = "stockChart";

    constructor(private apiService: ApiService, private tickerService: TickerService, private datePipe: DatePipe) { }

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
            });

            // Fetching quote data
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

            // Fetching news data
            this.apiService.getNewsData(this.ticker).subscribe((newsData: any) => {
                const filteredNews = newsData
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

            this.apiService.getHistoricalData(this.ticker).subscribe((historicalData: any) => {
                this.historicalData = historicalData;
                const ohlc : any[] = [], volume : any[]= [];
                if (historicalData.results && historicalData.results.length){
    for (let i = 0; i < historicalData.results.length; i += 1) {
        ohlc.push([
            historicalData.results[i].t, // the date
            historicalData.results[i].o, // open
            historicalData.results[i].h, // high
            historicalData.results[i].l, // low
            historicalData.results[i].c // close
        ]);

        volume.push([
            historicalData.results[i].t, // the date
            historicalData.results[i].v // the volume
        ]);
    }}

    this.chartTabOptions = {
        rangeSelector: {
          buttons: [{
              'type': 'month',
              'count': 1,
              'text': '1m',
          }, {
              'type': 'month',
              'count': 3,
              'text': '3m',
          }, {
              'type': 'month',
              'count': 6,
              'text': '6m',
          }, {
              'type': 'ytd',  
              'text': 'YTD',
          }, {
              'type': 'year',
              'count': 1,
              'text': '1Y',
          }, {
              'type': 'all',
              'text': 'All',
          }],
          selected: 2, // set 6m as default
        },
        title: { text: historicalData.ticker + ' Historical'},
        subtitle: { text: 'With SMA and Volume by Price technical indicators'},
        xAxis: {
          type: 'datetime'
        },
        yAxis: [{
          startOnTick: false,
          endOnTick: false,
          labels: {
              align: 'right',
              x: -3
          },
          title: {
              text: 'OHLC'
          },
          height: '60%',
          lineWidth: 2,
          resize: {
              enabled: true
          }
      }, {
          labels: {
              align: 'right',
              x: -3
          },
          title: {
              text: 'Volume'
          },
          top: '65%',
          height: '35%',
          offset: 0,
          lineWidth: 2
      }],
      tooltip: {
          split: true
      },
      chart: {
        backgroundColor: '#f4f4f4',
      },
      series: [{
          type: 'candlestick',
          name: historicalData.ticker,
          id: historicalData.ticker,
          zIndex: 2,
          data: ohlc
      }, {
          type: 'column',
          name: 'Volume',
          id: 'volume',
          data: volume,
          yAxis: 1
      }, {
          type: 'vbp',
          linkedTo: historicalData.ticker,
          params: {
              volumeSeriesID: 'volume'
          },
          dataLabels: {
              enabled: false
          },
          zoneLines: {
              enabled: false
          }
      }, {
          type: 'sma',
          linkedTo: historicalData.ticker,
          zIndex: 1,
          marker: {
              enabled: false
          }
      }],
      time: {
        useUTC: false,
        timezone: 'America/Los_Angeles'
      },
    }

            });

        //     this.apiService.getHourlyData(this.ticker).subscribe((hourlyData: any) => {
        //         this.hourlyData = hourlyData;
        //         console.log(this.change)
        //         const priceData: [number, number][] = [];
        //         if (hourlyData.results && hourlyData.results.length) {
        //             for (let i = hourlyData.results.length - 1; i >= 0; i--) {
        //                 priceData.unshift([hourlyData.results[i].t, hourlyData.results[i].c]);
        //                 if (priceData.length >= 32) {
        //                     break;
        //                 }
        //             }
        //         }
        //         if (this.change > 0) {
        //             this.lineColor = 'green';
        //         }
        //         else {
        //             this.lineColor = 'red';
        //         }
        //         console.log(priceData)
        //         console.log(this.lineColor)
        //         this.hourlyOptions = {
        //             colors: [this.lineColor],
        //             rangeSelector: {
        //                 enabled: false
        //             },
        //             navigator: {
        //                 enabled: false
        //             },
        //             title: {
        //                 text: hourlyData.ticker + ' Hourly Price Variation',
        //                 style: {
        //                     color: 'gray',
        //                 },
        //             },
        //             xAxis: {
        //                 type: 'datetime',
        //             },
        //             series: [{
        //                 name: hourlyData.ticker,
        //                 data: priceData,
        //                 type: 'line',
        //             }],
        //             tooltip: {
        //                 split: true,
        //             },
        //             time: {
        //                 useUTC: false,
        //                 timezone: 'America/Los_Angeles'
        //             },
        //             legend: {
        //                 enabled: false
        //             },
        //             chart: {
        //                 backgroundColor: '#f4f4f4',
        //             },
        //         };


        //     });
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
