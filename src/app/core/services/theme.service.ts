import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'app_theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private themeSubject = new BehaviorSubject<Theme>(this.load());
  theme$ = this.themeSubject.asObservable();

  constructor() {
    this.apply(this.themeSubject.value);
  }

  private load(): Theme {
    return (localStorage.getItem(STORAGE_KEY) as Theme) || 'light';
  }

  toggle() {
    const next = this.themeSubject.value === 'light' ? 'dark' : 'light';
    this.set(next);
  }

  set(theme: Theme) {
    localStorage.setItem(STORAGE_KEY, theme);
    this.themeSubject.next(theme);
    this.apply(theme);
  }

  private apply(theme: Theme) {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
  }
}
