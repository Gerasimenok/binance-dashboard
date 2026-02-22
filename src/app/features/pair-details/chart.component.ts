import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective } from 'ngx-echarts';
import { BinanceRestService } from '../../core/services/binance-rest.service';
import { BinanceWsService } from '../../core/services/binance-ws.service';
import { Subject, takeUntil } from 'rxjs';

export type Interval = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit, OnDestroy {

  @Input() symbol!: string;

  intervals: Interval[] = ['1m', '5m', '15m', '1h', '4h', '1d'];
  interval: Interval = '1m';

  options: any;
  private destroy$ = new Subject<void>();
  private klineData: any[] = [];

  constructor(
    private rest: BinanceRestService,
    private ws: BinanceWsService
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  changeInterval(i: Interval): void {
    this.interval = i;
    this.loadHistory();
  }

  private loadHistory(): void {
    this.rest.getKlines(this.symbol, this.interval, 200)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.klineData = data;
        this.buildChart();
        this.connectWebSocket();
      });
  }

  private connectWebSocket(): void {
    this.ws
      .connect(`${this.symbol.toLowerCase()}@kline_${this.interval}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe(wsData => {
        const k = wsData.k;
        
        if (this.klineData.length > 0) {
          const lastIndex = this.klineData.length - 1;
          this.klineData[lastIndex] = [
            k.t, k.o, k.h, k.l, k.c, k.v, 
            k.T, k.q, k.n, k.V, k.Q, k.B
          ];
          this.buildChart();
        }
      });
  }

  private buildChart(): void {
    const times = this.klineData.map(d => 
      new Date(d[0]).toLocaleTimeString()
    );

    const candles = this.klineData.map(d => [
      +d[1], // open
      +d[4], // close
      +d[3], // low
      +d[2]  // high
    ]);

    const closes = this.klineData.map(d => +d[4]);

    const sma = this.calcSMA(closes, 14);
    const ema = this.calcEMA(closes, 14);

    this.options = {
      tooltip: { trigger: 'axis' },
      legend: {
        data: ['Price', 'SMA 14', 'EMA 14']
      },
      xAxis: {
        type: 'category',
        data: times,
        boundaryGap: false
      },
      yAxis: {
        scale: true
      },
      series: [
        {
          name: 'Price',
          type: 'candlestick',
          data: candles,
          itemStyle: {
            color: '#26a69a',
            color0: '#ef5350',
            borderColor: '#26a69a',
            borderColor0: '#ef5350'
          }
        },
        {
          name: 'SMA 14',
          type: 'line',
          data: sma,
          smooth: true,
          showSymbol: false,
          lineStyle: { color: '#2962ff', width: 2 }
        },
        {
          name: 'EMA 14',
          type: 'line',
          data: ema,
          smooth: true,
          showSymbol: false,
          lineStyle: { color: '#ff6d00', width: 2 }
        }
      ]
    };
  }

  private calcSMA(data: number[], period: number): (number | null)[] {
    return data.map((_, i) => {
      if (i < period - 1) return null;
      const slice = data.slice(i - period + 1, i + 1);
      return +(slice.reduce((a, b) => a + b, 0) / period).toFixed(2);
    });
  }

  private calcEMA(data: number[], period: number): (number | null)[] {
    const k = 2 / (period + 1);
    let emaPrev = data[0];

    return data.map((price, i) => {
      if (i === 0) return price;
      emaPrev = price * k + emaPrev * (1 - k);
      return +emaPrev.toFixed(2);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}