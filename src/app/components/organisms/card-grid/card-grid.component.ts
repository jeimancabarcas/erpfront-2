import { Component, input, output, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentCardMolecule } from '../../molecules/content-card/content-card.component';
import { CardAtom } from '../../atoms/card/card.component';
import { SkeletonAtom } from '../../atoms/skeleton/skeleton.component';
import { ButtonAtom } from '../../atoms/button/button.component';
import { CardItem } from '../../../models/organism.models';

@Component({
  selector: 'app-card-grid',
  standalone: true,
  imports: [CommonModule, ContentCardMolecule, CardAtom, SkeletonAtom, ButtonAtom],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './card-grid.component.scss',
  template: `
    <section class="card-grid" role="region" aria-label="Card grid">
      @if (loading()) {
        <div class="card-grid__list" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))">
          @for (_ of skeletonItems; track $index) {
            <div class="card-grid__item" [style.--card-item-max-width]="itemMaxWidth()">
              <ui-card>
                <ui-skeleton variant="card"></ui-skeleton>
                <div class="card-grid__skeleton-body">
                  <ui-skeleton variant="text" width="80%"></ui-skeleton>
                  <ui-skeleton variant="text" width="60%"></ui-skeleton>
                </div>
              </ui-card>
            </div>
          }
        </div>
      } @else if (items().length === 0) {
        <div class="card-grid__empty">
          <span class="material-icons card-grid__empty-icon">inventory_2</span>
          <p class="card-grid__empty-text">{{ emptyMessage() || 'No hay elementos' }}</p>
        </div>
      } @else {
        <div class="card-grid__list" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))">
          @for (item of items(); track item.id) {
            <div class="card-grid__item" [style.--card-item-max-width]="itemMaxWidth()">
              <ui-content-card
                [title]="item.title"
                [subtitle]="item.subtitle || ''"
                [imageUrl]="item.imageUrl || ''"
                (clicked)="onCardClick(item)"
              />
            </div>
          }
        </div>
        @if (hasMore()) {
          <div class="card-grid__footer">
            <ui-button variant="outline" (clicked)="loadMore.emit()">
              Cargar más
            </ui-button>
          </div>
        }
      }
    </section>
  `
})
export class CardGridOrganism {
  items = input<CardItem[]>([]);
  columns = input<1 | 2 | 3 | 4>(3);
  loading = input(false);
  emptyMessage = input('');
  hasMore = input(false);

  loadMore = output<void>();
  cardClick = output<CardItem>();

  protected skeletonItems = Array(6).fill(null);

  itemMaxWidth = computed(() => {
    const n = this.columns();
    // Account for gap: (N-1) * 1.5rem between items, divided by N
    return `calc((100% - ${(n - 1) * 1.5}rem) / ${n})`;
  });

  onCardClick(item: CardItem): void {
    this.cardClick.emit(item);
  }
}
