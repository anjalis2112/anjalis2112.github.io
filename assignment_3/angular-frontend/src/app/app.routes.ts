import { Routes } from '@angular/router';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { StockDetailsComponent } from './stock-details/stock-details.component';

export const routes: Routes = [
    {
        path: 'search/:ticker', 
        component: StockDetailsComponent
    }
];
