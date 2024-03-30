import { Component } from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component';
import { FinnhubFooterComponent } from './finnhub-footer/finnhub-footer.component';
import { RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    NavbarComponent,
    RouterOutlet,
    FinnhubFooterComponent,
    RouterModule
  ],

})
export class AppComponent {
  title = 'frontend';
}


