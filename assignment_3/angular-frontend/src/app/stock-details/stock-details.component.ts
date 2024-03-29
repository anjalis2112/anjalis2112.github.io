import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from '../api.service';
import { TickerService } from '../ticker.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { HighchartsChartModule } from 'highcharts-angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FavoriteData } from '../favorite.interface';
import * as Highcharts from 'highcharts/highstock';
import indicators from 'highcharts/indicators/indicators';
import vbp from 'highcharts/indicators/volume-by-price';
import { MatTabsModule } from '@angular/material/tabs';
import { MdbTabsModule } from 'mdb-angular-ui-kit/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
    imports: [CommonModule, RouterModule, HttpClientModule, NgbModule, HighchartsChartModule, FontAwesomeModule, MatTabsModule, MdbTabsModule, MatProgressSpinnerModule],
    providers: [DatePipe]
})
export class StockDetailsComponent implements OnInit {
    @Input() ticker: any;
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

    isFavorite: boolean = false;
    isLoading: boolean = false;
    isPositive: boolean = false;

    constructor(private tickerService: TickerService, private apiService: ApiService) { }

    ngOnInit(): void {
        console.log("IM HEREEE")
        this.isLoading = true;
        console.log(this.isLoading);
        this.tickerService.ticker$.subscribe(ticker => {
            this.ticker = ticker;
            this.tickerService.fetchData().subscribe(() => {
                this.setValues();
            });
        });

        
        
        console.log(this.isLoading);
    }

    private setValues() {
        this.companyName = this.tickerService.companyName;
        this.companyLogo = this.tickerService.companyLogo;
        this.exchangeCode = this.tickerService.exchangeCode;
        this.lastPrice = this.tickerService.lastPrice;
        this.change = this.tickerService.change;
        this.changePercent = this.tickerService.changePercent;
        this.timestamp = this.tickerService.timestamp;
        this.highPrice = this.tickerService.highPrice;
        this.lowPrice = this.tickerService.lowPrice;
        this.openPrice = this.tickerService.openPrice;
        this.prevClosePrice = this.tickerService.prevClosePrice;
        this.ipoStartDate = this.tickerService.ipoStartDate;
        this.industry = this.tickerService.industry;
        this.webpage = this.tickerService.webpage;
        this.companyPeers = this.tickerService.companyPeers;
        this.news = this.tickerService.news;
        this.totalMSPR = this.tickerService.totalMSPR;
        this.positiveMSPR = this.tickerService.positiveMSPR;
        this.negativeMSPR = this.tickerService.negativeMSPR;
        this.totalChange = this.tickerService.totalChange;
        this.positiveChange = this.tickerService.positiveChange;
        this.negativeChange = this.tickerService.negativeChange;
        this.hourlyData = this.tickerService.hourlyData;
        this.hourlyOptions = this.tickerService.hourlyOptions;
        this.historicalData = this.tickerService.historicalData;
        this.trendsData = this.tickerService.trendsData;
        this.surpriseData = this.tickerService.surpriseData;

        this.createHourlyChart();
        this.createChartTab();
        this.createRecommendChart();
        this.createSurpriseChart();
        this.checkFavoriteStatus();
        this.checkMarketClose();
        setTimeout(() => {
            this.isLoading = false;
        }, 10);

    }

    createHourlyChart() {
        const priceData: [number, number][] = [];
        if (this.hourlyData.results && this.hourlyData.results.length) {
            for (let i = this.hourlyData.results.length - 1; i >= 0; i--) {
                priceData.unshift([this.hourlyData.results[i].t, this.hourlyData.results[i].c]);
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
                text: this.hourlyData.ticker + ' Hourly Price Variation',
                style: {
                    color: 'gray',
                },
            },
            xAxis: {
                type: 'datetime',
            },
            series: [{
                name: this.hourlyData.ticker,
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
    }

    checkMarketClose() {
        setInterval(() => {
            const currentTime = new Date().getTime();
            const difference = (currentTime - this.timestamp.getTime()) / (1000 * 60); // Difference in minutes
            this.marketClosed = difference >= 5; // Set marketClosed flag based on difference
          }, 1000);
    }

    createChartTab() {
        const ohlc: any[] = [], volume: any[] = [];
        if (this.historicalData.results && this.historicalData.results.length) {
            for (let i = 0; i < this.historicalData.results.length; i += 1) {
                ohlc.push([
                    this.historicalData.results[i].t, // the date
                    this.historicalData.results[i].o, // open
                    this.historicalData.results[i].h, // high
                    this.historicalData.results[i].l, // low
                    this.historicalData.results[i].c // close
                ]);

                volume.push([
                    this.historicalData.results[i].t, // the date
                    this.historicalData.results[i].v // the volume
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
            title: { text: this.historicalData.ticker + ' Historical' },
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
                name: this.historicalData.ticker,
                id: this.historicalData.ticker,
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
                linkedTo: this.historicalData.ticker,
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
                linkedTo: this.historicalData.ticker,
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
    }

    createRecommendChart() {
        let period: any[] = [], strongBuy: any[] = [], buy: any[] = [], hold: any[] = [], sell: any[] = [], strongSell: any[] = [];
        if (this.trendsData.length) {
            for (let i = 0; i < this.trendsData.length; i++) {
                let length = this.trendsData[i].period.length;
                period.push(this.trendsData[i].period.substring(0, length - 3));
                strongBuy.push(this.trendsData[i].strongBuy);
                buy.push(this.trendsData[i].buy);
                hold.push(this.trendsData[i].hold);
                sell.push(this.trendsData[i].sell);
                strongSell.push(this.trendsData[i].strongSell);
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
    }

    createSurpriseChart() {
        let period: any[] = []
        let actual: any[] = [], estimate: any[] = [], surprise: Number[] = [];
        if (this.surpriseData.length) {
            for (let i = 0; i < this.surpriseData.length; i++) {
                period.push(this.surpriseData[i].period);
                actual.push(this.surpriseData[i].actual);
                estimate.push(this.surpriseData[i].estimate);
                surprise.push(this.surpriseData[i].surprise);
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
    }

    checkFavoriteStatus() {
        this.apiService.getFavorites().subscribe(favorites => {
          const favoritesArray = favorites as FavoriteData[];
          this.isFavorite = favoritesArray.some(favorite => favorite.ticker === this.ticker);
        });
      }
      updateFavorites(ticker: string, name?: string) {
        this.apiService.updateFavorites(ticker, name).subscribe(data => {
        });
        this.isFavorite = !this.isFavorite;
      }
}