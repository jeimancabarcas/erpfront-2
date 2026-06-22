import { Component, input, output, signal, inject, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LogoComponent } from '../../atoms/logo/logo.component';
import { MenuItemMolecule } from '../../molecules/menu-item/menu-item.component';
import { MenuGroup } from '../../../models/organism.models';

@Component({
  selector: 'app-sidebar-organism',
  standalone: true,
  imports: [CommonModule, LogoComponent, MenuItemMolecule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app-sidebar.component.scss',
  host: {
    'role': 'navigation',
    '[attr.aria-label]': '"Menú principal"',
    '[class.sidebar--mobile-open]': 'mobileOpen()',
  },
  template: `
    <!-- Backdrop (mobile only) -->
    @if (mobileOpen()) {
      <div class="sidebar__backdrop" (click)="onBackdropClick()" (keydown.escape)="onEscape()"></div>
    }

    <aside class="sidebar" [class.sidebar--open]="mobileOpen()">
      <!-- Logo -->
      <div class="sidebar__logo">
        <app-logo />
      </div>

      <!-- Menu groups -->
      <div class="sidebar__menu">
        @for (group of menuGroups(); track group.label) {
          <div class="sidebar__group">
            <!-- Group header (clickable to collapse/expand) -->
            <button
              class="sidebar__group-header"
              (click)="toggleGroup(group.label)"
              [attr.aria-expanded]="isExpanded(group.label)"
            >
              <span class="material-icons sidebar__group-icon">{{ groupIcon(group) }}</span>
              <span class="sidebar__group-label">{{ group.label }}</span>
              <span class="material-icons sidebar__group-chevron" [class.sidebar__group-chevron--expanded]="isExpanded(group.label)">
                chevron_left
              </span>
            </button>

            <!-- Items (collapsible) -->
            @if (isExpanded(group.label)) {
              <div class="sidebar__items">
                @for (item of group.items; track item.label + item.routerLink) {
                  <ui-menu-item
                    [icon]="item.icon"
                    [label]="item.label"
                    [count]="item.count || 0"
                    [active]="isActive(item.routerLink)"
                    [disabled]="item.disabled || false"
                    [routerLink]="item.routerLink"
                    (clicked)="onItemClick(item.routerLink)"
                  />
                }
              </div>
            }
          </div>
        }
      </div>
    </aside>
  `
})
export class AppSidebarOrganism {
  menuGroups = input<MenuGroup[]>([]);
  collapsed = input(false);
  mobileOpen = input(false);

  mobileClose = output<void>();
  menuItemClick = output<string>();

  private router = inject(Router);

  /** Track which groups are expanded by label */
  private expandedGroups = signal<Set<string>>(new Set());

  protected isExpanded(label: string): boolean {
    return this.expandedGroups().has(label);
  }

  protected toggleGroup(label: string): void {
    const next = new Set(this.expandedGroups());
    if (next.has(label)) {
      next.delete(label);
    } else {
      next.add(label);
    }
    this.expandedGroups.set(next);
  }

  /** Default icon per group label, or first item icon */
  protected groupIcon(group: MenuGroup): string {
    return group.items.length > 0 ? group.items[0].icon : 'folder';
  }

  protected isActive(routerLink: string): boolean {
    return this.router.url.startsWith(routerLink);
  }

  protected onItemClick(routerLink: string): void {
    this.menuItemClick.emit(routerLink);
    if (this.mobileOpen()) {
      this.mobileClose.emit();
    }
  }

  protected onBackdropClick(): void {
    this.mobileClose.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.mobileOpen()) {
      this.mobileClose.emit();
    }
  }
}
