import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private theme = signal<'light' | 'dark'>('light');
  readonly isDark = computed(() => this.theme() === 'dark');

  constructor() {
    // Check localStorage first, then system preference
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') {
      this.setTheme(stored);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.setTheme('dark');
    }
  }

  toggle(): void {
    this.setTheme(this.isDark() ? 'light' : 'dark');
  }

  setTheme(t: 'light' | 'dark'): void {
    this.theme.set(t);
    localStorage.setItem('theme', t);
    document.documentElement.classList.toggle('dark', t === 'dark');
  }
}
