import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinkActive, RouterModule } from '@angular/router';
import { TickerService } from '../ticker.service';

@Component({
  selector: 'ng-navbar',
  standalone: true,
  imports: [
    RouterLinkActive,
    RouterModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  constructor(private router: Router, private tickerService: TickerService) { }

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  checkSearchTicker() {
    const tickerVal = this.tickerService.ticker
    console.log("INSIDE SEARCH TICKER IN NAV", tickerVal);
    if (tickerVal) {
      this.router.navigate(['/search', tickerVal]);
    } else {
      this.router.navigate(['/search']);
    }
  }
}