import { Routes } from '@angular/router';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { StockDetailsComponent } from './stock-details/stock-details.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'search/home',
        pathMatch: 'full'
    },
    {
        path: 'search',
        redirectTo: 'search/home',
        pathMatch: 'full'
    },
    {
        path: 'search/home',
        component: SearchBarComponent
    },
    {
        path: 'search/:ticker',
        component: SearchBarComponent
    }
];
export default routes;
