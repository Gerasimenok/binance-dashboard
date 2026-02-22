import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  currentTheme: 'light' | 'dark' = 'light';

  constructor(private theme: ThemeService) {
    this.theme.theme$.subscribe(t => this.currentTheme = t);
  }

  toggleTheme() {
    this.theme.toggle();
  }
}