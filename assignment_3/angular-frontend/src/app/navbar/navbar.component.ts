import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinkActive } from '@angular/router';
import { DataStorerService } from '../data-storer.service';

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
  constructor(private router: Router, private dataService: DataStorerService) { }

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  checkSearchTicker() {
    const tickerVal = this.dataService.getLastSearchArg();
    console.log("INSIDE SEARCH TICKER IN NAV", tickerVal);
    if (tickerVal) {
      this.router.navigate(['/search', tickerVal]);
    } else {
      this.router.navigate(['/search']);
    }
  }
}