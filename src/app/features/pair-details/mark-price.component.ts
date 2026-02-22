import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { BinanceWsService } from '../../core/services/binance-ws.service';

@Component({
  selector: 'app-mark-price',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mark-price.component.html',
  styleUrls: ['./mark-price.component.scss']
})
export class MarkPriceComponent implements OnInit, OnDestroy {
  @Input() symbol!: string;

  markPrice = '';
  fundingRate = '';

  private destroy$ = new Subject<void>();

  constructor(private ws: BinanceWsService) {}

  ngOnInit(): void {
    this.ws.connect(`${this.symbol.toLowerCase()}@markPrice`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.markPrice = data.p;
          this.fundingRate = (data.r * 100).toFixed(4);
        },
        error: (err) => {
          console.error('Ошибка markPrice:', err);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}