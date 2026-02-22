import { Routes } from '@angular/router';
import { MarketComponent } from './features/market/market.component';
import { PairDetailsComponent } from './features/pair-details/pair-details.component';

export const routes: Routes = [
  { path: '', component: MarketComponent },
  { path: 'pair/:symbol', component: PairDetailsComponent },
  { path: '**', redirectTo: '' }
];
