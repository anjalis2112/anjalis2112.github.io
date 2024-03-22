import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinkActive} from '@angular/router';

@Component({
  selector: 'ng-navbar',
  standalone: true,
  imports: [
    RouterLinkActive,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
    constructor(private router:Router) {}

    onSearchClick() {
      this.router.navigate(['/search']);
    }

    onWatchlistClick() {
      this.router.navigate(['/watchlist']);
    }

    onPortfolioClick() {
      this.router.navigate(['/portfolio']);
    }
}