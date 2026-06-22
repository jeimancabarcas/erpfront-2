import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardAtom } from '../../atoms/card/card.component';

export interface StatItem {
  label: string;
  value: number;
  icon?: string;
  trend?: 'up' | 'down';
  trendValue?: number;
}

@Component({
  selector: 'ui-stats-grid',
  standalone: true,
  imports: [CommonModule, CardAtom],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './stats-grid.component.scss',
  template: `
    <div class="stats-grid">
      @for (stat of stats(); track $index; let idx = $index) {
        <ui-card class="stats-grid__card" (click)="onCardClick(idx)">
          <div class="stats-grid__card-inner">
            @if (stat.icon) {
              <div class="stats-grid__icon">
                <span class="material-icons">{{ stat.icon }}</span>
              </div>
            }
            <div class="stats-grid__info">
              <span class="stats-grid__value">{{ stat.value }}</span>
              <span class="stats-grid__label">{{ stat.label }}</span>
            </div>
            @if (stat.trend) {
              <div
                class="stats-grid__trend"
                [class.stats-grid__trend--up]="stat.trend === 'up'"
                [class.stats-grid__trend--down]="stat.trend === 'down'"
              >
                @if (stat.trend === 'up') {
                  <span class="stats-grid__trend-icon material-icons">arrow_upward</span>
                } @else {
                  <span class="stats-grid__trend-icon material-icons">arrow_downward</span>
                }
                @if (stat.trendValue != null) {
                  <span class="stats-grid__trend-value">{{ stat.trendValue }}%</span>
                }
              </div>
            }
          </div>
        </ui-card>
      }
    </div>
  `
})
export class StatsGridMolecule {
  stats = input<StatItem[]>([]);

  cardClick = output<number>();

  onCardClick(index: number): void {
    this.cardClick.emit(index);
  }
}
