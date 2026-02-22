import {
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { BinanceRestService } from '../../core/services/binance-rest.service';
import { BinanceWsService } from '../../core/services/binance-ws.service';

export interface OrderLevel {
  price: number;
  quantity: number;
  previousQuantity?: number;
  highlight?: 'up' | 'down';
}

@Component({
  selector: 'app-order-book',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-book.component.html',
  styleUrls: ['./order-book.component.scss']
})
export class OrderBookComponent implements OnInit, OnDestroy {

  @Input() symbol!: string;

  bids: OrderLevel[] = [];
  asks: OrderLevel[] = [];

  private destroy$ = new Subject<void>();
  private lastUpdateId = 0;

  constructor(
    private rest: BinanceRestService,
    private ws: BinanceWsService
  ) {}

  ngOnInit(): void {
    this.loadSnapshot();
  }

  private loadSnapshot(): void {
    this.rest.getDepth(this.symbol, 20)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (snapshot) => {
          this.lastUpdateId = snapshot.lastUpdateId;

          this.bids = (snapshot.bids || [])
            .map((b: string[]) => ({
              price: +b[0],
              quantity: +b[1]
            }))
            .sort((a: OrderLevel, b: OrderLevel) => b.price - a.price);

          this.asks = (snapshot.asks || [])
            .map((a: string[]) => ({
              price: +a[0],
              quantity: +a[1]
            }))
            .sort((a: OrderLevel, b: OrderLevel) => a.price - b.price);

          this.connectWs();
        },
        error: (err) => {
          console.error('Ошибка загрузки depth snapshot:', err);
        }
      });
  }

  private connectWs(): void {
    this.ws
      .connect(`${this.symbol.toLowerCase()}@depth20@100ms`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          if (data.u <= this.lastUpdateId) return;
          this.lastUpdateId = data.u;

          if (data.b && Array.isArray(data.b)) {
            this.updateSide(data.b, this.bids, true);
          }
          
          if (data.a && Array.isArray(data.a)) {
            this.updateSide(data.a, this.asks, false);
          }
        },
        error: (err) => {
          console.error('Ошибка WebSocket:', err);
        }
      });
  }

  private updateSide(
    incoming: string[][],
    current: OrderLevel[],
    isBid: boolean
  ): void {
    if (!incoming || !Array.isArray(incoming)) return;

    const currentMap = new Map(current.map((item: OrderLevel) => [item.price, item]));

    incoming.forEach((level: string[]) => {
      if (!level || level.length < 2) return;
      
      const price = +level[0];
      const quantity = +level[1];

      if (quantity === 0) {
        const index = current.findIndex((item: OrderLevel) => item.price === price);
        if (index !== -1) current.splice(index, 1);
      } else {
        const existing = currentMap.get(price);
        if (existing) {
          const prevQty = existing.quantity;
          if (prevQty !== quantity) {
            existing.highlight = quantity > prevQty ? 'up' : 'down';
            existing.previousQuantity = prevQty;
            existing.quantity = quantity;

            setTimeout(() => {
              existing.highlight = undefined;
            }, 400);
          }
        } else {
          current.push({ price, quantity });
        }
      }
    });

    current.sort((a: OrderLevel, b: OrderLevel) => 
      isBid ? b.price - a.price : a.price - b.price
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}