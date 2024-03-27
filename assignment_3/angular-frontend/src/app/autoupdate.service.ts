import { Injectable } from '@angular/core';
import { interval, Observable } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class AutoUpdateService {
  constructor(private backendService: ApiService) {}

  getUpdateSignal(): Observable<number> {
    // emit value at start and every 15 seconds
    return interval(15000).pipe(startWith(0));
  }
}