import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface Ticker24h {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  volume: string;
  highPrice: string;
  lowPrice: string;
}

@Injectable({ providedIn: 'root' })
export class BinanceRestService {

  private readonly API = 'https://fapi.binance.com';

  constructor(private http: HttpClient) {}

  get24hTickers(): Observable<Ticker24h[]> {
    return this.http
      .get<Ticker24h[]>(`${this.API}/fapi/v1/ticker/24hr`)
      .pipe(catchError(err => throwError(() => err)));
  }

  getExchangeInfo(): Observable<any> {
    return this.http
      .get(`${this.API}/fapi/v1/exchangeInfo`)
      .pipe(catchError(err => throwError(() => err)));
  }

  getKlines(symbol: string, interval: string, limit = 500) {
    return this.http
      .get<any[]>(`${this.API}/fapi/v1/klines`, {
        params: { symbol, interval, limit }
      })
      .pipe(catchError(err => throwError(() => err)));
  }

  getDepth(symbol: string, limit = 20) {
    return this.http
      .get<any>(`${this.API}/fapi/v1/depth`, {
        params: { symbol, limit }
      })
      .pipe(catchError(err => throwError(() => err)));
  }
}
