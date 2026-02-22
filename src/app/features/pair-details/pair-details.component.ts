import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ChartComponent } from './chart.component';
import { OrderBookComponent } from './order-book.component';
import { TradesComponent } from './trades.component';
import { Stats24hComponent } from './stats24h.component';
import { MarkPriceComponent } from './mark-price.component';
import { BinanceWsService } from '../../core/services/binance-ws.service';

@Component({
  selector: 'app-pair-details',
  standalone: true,
  imports: [
    CommonModule,
    ChartComponent,
    OrderBookComponent,
    TradesComponent,
    Stats24hComponent,
    MarkPriceComponent
  ],
  template: `
    <h2>{{ symbol }}</h2>

    <app-mark-price [symbol]="symbol"></app-mark-price>
    <app-chart [symbol]="symbol"></app-chart>
    <app-stats24h [symbol]="symbol"></app-stats24h>
    <app-order-book [symbol]="symbol"></app-order-book>
    <app-trades [symbol]="symbol"></app-trades>
  `
})
export class PairDetailsComponent implements OnInit, OnDestroy {

  symbol!: string;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private ws: BinanceWsService
  ) {
    this.symbol = this.route.snapshot.paramMap.get('symbol')!;
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}