import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { BinanceRestService, Ticker24h } from '../../core/services/binance-rest.service';
import { FavoritesService } from '../../core/services/favorites.service';

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ScrollingModule
  ],
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss']
})
export class MarketComponent implements OnInit {

  all: Ticker24h[] = [];
  filtered: Ticker24h[] = [];

  search = '';
  sortColumn: keyof Ticker24h = 'symbol';
  sortAsc = true;

  constructor(
    private api: BinanceRestService,
    private favorites: FavoritesService
  ) {}

  ngOnInit(): void {
    this.api.getExchangeInfo().subscribe(info => {

      const activeSymbols = new Set(
        info.symbols
          .filter((s: any) => s.status === 'TRADING')
          .map((s: any) => s.symbol)
      );

      this.api.get24hTickers().subscribe(tickers => {
        this.all = tickers.filter(t => activeSymbols.has(t.symbol));
        this.applyFilter();
      });
    });
  }

  applyFilter(): void {
    this.filtered = this.all
      .filter(t => t.symbol.toLowerCase().includes(this.search.toLowerCase()))
      .sort((a, b) => {

        const valA = a[this.sortColumn];
        const valB = b[this.sortColumn];

        if (!isNaN(+valA) && !isNaN(+valB)) {
          return this.sortAsc ? +valA - +valB : +valB - +valA;
        }

        return this.sortAsc
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      });
  }

  sort(column: keyof Ticker24h): void {
    if (this.sortColumn === column) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortColumn = column;
      this.sortAsc = true;
    }
    this.applyFilter();
  }

  toggleFavorite(symbol: string, event: Event) {
    event.stopPropagation();
    this.favorites.toggle(symbol);
  }

  isFavorite(symbol: string): boolean {
    return this.favorites.isFavorite(symbol);
  }

  trackBySymbol(index: number, item: Ticker24h) {
    return item.symbol;
  }
}
