import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { SearchBarComponent } from './search-bar/search-bar.component'; 
import { NavbarComponent } from './navbar/navbar.component';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    HttpClientModule,
    SearchBarComponent,
    NavbarComponent,
    RouterOutlet,
    CommonModule,
  ],
  
})
export class AppComponent{
  title = 'frontend';
}


