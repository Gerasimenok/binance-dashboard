import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const STORAGE_KEY = 'favorite_pairs';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {

  private favoritesSubject = new BehaviorSubject<Set<string>>(this.load());
  favorites$ = this.favoritesSubject.asObservable();

  private load(): Set<string> {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  }

  private save(set: Set<string>) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  }

  toggle(symbol: string) {
    const set = new Set(this.favoritesSubject.value);

    if (set.has(symbol)) {
      set.delete(symbol);
    } else {
      set.add(symbol);
    }

    this.save(set);
    this.favoritesSubject.next(set);
  }

  isFavorite(symbol: string): boolean {
    return this.favoritesSubject.value.has(symbol);
  }
}
