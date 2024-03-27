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

interface InsiderData {
    symbol: string;
    year: number;
    month: number;
    change: number;
    mspr: number;
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

    //insights
    trendsData: any;
    surpriseData: any;
    recommendCharts: typeof Highcharts = Highcharts;
    recommendOptions: any;
    surpriseCharts: typeof Highcharts = Highcharts;
    surpriseOptions: Highcharts.Options = {};

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

                // Assign the filtered and mapped data to the news property
                this.news = { news: filteredNews };
            });

            // Fetching insider data
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

            // Fetching trends data
            this.apiService.getTrendsData(this.ticker).subscribe((trendsData: any) => {
                this.trendsData = trendsData;
                let period: any[] = [], strongBuy: any[] = [], buy: any[] = [], hold: any[] = [], sell: any[] = [], strongSell: any[] = [];
                if (trendsData.length) {
                    for (let i = 0; i < trendsData.length; i++) {
                        let length = trendsData[i].period.length;
                        period.push(trendsData[i].period.substring(0, length - 3));
                        strongBuy.push(trendsData[i].strongBuy);
                        buy.push(trendsData[i].buy);
                        hold.push(trendsData[i].hold);
                        sell.push(trendsData[i].sell);
                        strongSell.push(trendsData[i].strongSell);
                    }

                }
                this.recommendOptions = {
                    chart: {
                        type: 'column',
                        backgroundColor: '#f4f4f4',
                    },
                    title: {
                        text: 'Recommendation Trends'
                    },
                    xAxis: {
                        categories: period,
                        //crosshair: true
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: '#Analysis'
                        },
                    },
                    plotOptions: {
                        column: {
                            stacking: 'normal',
                            dataLabels: {
                                enabled: true
                            }
                        }
                    },
                    series: [{
                        name: 'Strong Buy',
                        data: strongBuy,
                        type: 'column',
                        color: 'darkgreen',
                    }, {
                        name: 'Buy',
                        data: buy,
                        type: 'column',
                        color: 'green',
                    }, {
                        name: 'Hold',
                        data: hold,
                        type: 'column',
                        color: '#B07E28',
                    }, {
                        name: 'Sell',
                        data: sell,
                        type: 'column',
                        color: 'red',
                    }, {
                        name: 'Strong Sell',
                        data: strongSell,
                        type: 'column',
                        color: 'darkred',
                    }],
                }
            });

            // Fetching earnings data
            this.apiService.getEarningsData(this.ticker).subscribe((surpriseData: any) => {
                this.surpriseData = surpriseData.earnings;
                let period: any[] = []
                let actual: any[] = [], estimate: any[] = [], surprise: Number[] = [];
                if (surpriseData.length) {
                    for (let i = 0; i < surpriseData.length; i++) {
                        period.push(surpriseData[i].period);
                        actual.push(surpriseData[i].actual);
                        estimate.push(surpriseData[i].estimate);
                        surprise.push(surpriseData[i].surprise);
                    }
                }
                this.surpriseOptions = {
                    chart: {
                        type: 'spline',
                        backgroundColor: '#f4f4f4',
                    },
                    title: {
                        text: 'Historical EPS Surprises'
                    },
                    xAxis: {
                        categories: period,
                        // showLastLabel: true,
                        labels: {
                            useHTML: true,
                            formatter: function () {
                                let surpriseValue = surprise[this.pos];
                                return '<div style="text-align: center;">' + this.value + '<br><span>Surprise: ' + surpriseValue + '</span></div>';
                            }
                        }
                    },
                    yAxis: {
                        title: {
                            text: 'Quantity EPS'
                        },
                    },
                    series: [{
                        name: 'Actual',
                        data: actual,
                        type: 'spline',
                    }, {
                        name: 'Estimate',
                        data: estimate,
                        type: 'spline',
                    }]
                }
            })

            // Fetching peers data
            this.apiService.getPeersData(this.ticker).subscribe((peersData: any) => {
                this.companyPeers = peersData; // Assuming the response structure matches your peers data
            });

            this.apiService.getHistoricalData(this.ticker).subscribe((historicalData: any) => {
                this.historicalData = historicalData;
                const ohlc: any[] = [], volume: any[] = [];
                if (historicalData.results && historicalData.results.length) {
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
                    }
                }

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
                    title: { text: historicalData.ticker + ' Historical' },
                    subtitle: { text: 'With SMA and Volume by Price technical indicators' },
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

            this.apiService.getHourlyData(this.ticker).subscribe((hourlyData: any) => {
                this.hourlyData = hourlyData;
                const priceData: [number, number][] = [];
                if (hourlyData.results && hourlyData.results.length) {
                    for (let i = hourlyData.results.length - 1; i >= 0; i--) {
                        priceData.unshift([hourlyData.results[i].t, hourlyData.results[i].c]);
                        if (priceData.length >= 32) {
                            break;
                        }
                    }
                }
                if (this.change > 0) {
                    this.lineColor = 'green';
                }
                else {
                    this.lineColor = 'red';
                }
                this.hourlyOptions = {
                    colors: [this.lineColor],
                    rangeSelector: {
                        enabled: false
                    },
                    navigator: {
                        enabled: false
                    },
                    title: {
                        text: hourlyData.ticker + ' Hourly Price Variation',
                        style: {
                            color: 'gray',
                        },
                    },
                    xAxis: {
                        type: 'datetime',
                    },
                    series: [{
                        name: hourlyData.ticker,
                        data: priceData,
                        type: 'line',
                    }],
                    tooltip: {
                        split: true,
                    },
                    time: {
                        useUTC: false,
                        timezone: 'America/Los_Angeles'
                    },
                    legend: {
                        enabled: false
                    },
                    chart: {
                        backgroundColor: '#f4f4f4',
                    },
                };


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
