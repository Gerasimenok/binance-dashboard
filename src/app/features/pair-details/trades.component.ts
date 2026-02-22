import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BinanceWsService } from '../../core/services/binance-ws.service';
import { Subject, takeUntil } from 'rxjs';

export interface AggTrade {
  id: number;
  price: number;
  quantity: number;
  time: number;
  isBuyerMaker: boolean;
}

@Component({
  selector: 'app-trades',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trades.component.html',
  styleUrls: ['./trades.component.scss']
})
export class TradesComponent implements OnInit, OnDestroy {

  @Input() symbol!: string;

  trades: AggTrade[] = [];

  private destroy$ = new Subject<void>();
  private readonly MAX_TRADES = 50;

  constructor(private ws: BinanceWsService) {}

  ngOnInit(): void {
    this.ws
      .connect(`${this.symbol.toLowerCase()}@aggTrade`)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {

        const trade: AggTrade = {
          id: data.a,
          price: +data.p,
          quantity: +data.q,
          time: data.T,
          isBuyerMaker: data.m
        };

        this.trades.unshift(trade);

        if (this.trades.length > this.MAX_TRADES) {
          this.trades.pop();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}