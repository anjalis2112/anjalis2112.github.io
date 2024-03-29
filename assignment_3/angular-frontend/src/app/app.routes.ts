import { Routes } from '@angular/router';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { PortfolioComponent } from './portfolio/portfolio.component';

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
    },
    {
        path: 'watchlist',
        component: WatchlistComponent
    },
    {
        path: 'portfolio',
        component: PortfolioComponent
    },
];
export default routes;
