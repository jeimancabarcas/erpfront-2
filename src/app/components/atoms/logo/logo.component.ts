import { Component } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <div class="logo-container">
      <div class="logo-icon">
        <span class="logo-initial">E</span>
      </div>
      <span class="logo-text">ERP<span class="logo-accent">Core</span></span>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .logo-container {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
    }
    .logo-icon {
      width: 2.5rem;
      height: 2.5rem;
      background: var(--color-accent);
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-lg);
    }
    .logo-initial {
      color: var(--color-surface);
      font-weight: var(--font-bold);
      font-size: var(--text-xl);
      line-height: 1;
    }
    .logo-text {
      font-size: var(--text-2xl);
      font-weight: var(--font-bold);
      letter-spacing: -0.025em;
      color: var(--color-text-primary);
      line-height: var(--leading-tight);
    }
    .logo-accent {
      color: var(--color-accent);
    }
  `]
})
export class LogoComponent {}
