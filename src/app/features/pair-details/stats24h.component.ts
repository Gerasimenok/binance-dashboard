import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BinanceRestService } from '../../core/services/binance-rest.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-stats24h',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="high">
      High: {{ high }} |
      Low: {{ low }} |
      Volume: {{ volume }}
    </div>
  `
})
export class Stats24hComponent implements OnChanges, OnDestroy {

  @Input() symbol!: string;

  high = '';
  low = '';
  volume = '';

  private destroy$ = new Subject<void>();

  constructor(private api: BinanceRestService) {}

  ngOnChanges() {
    this.api.get24hTickers()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {

        const t = data.find(d => d.symbol === this.symbol);
        if (t) {
          this.high = t.highPrice;
          this.low = t.lowPrice;
          this.volume = t.volume;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
