import { Component, input, output, signal, inject, ElementRef, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonAtom } from '../../atoms/button/button.component';
import { AvatarAtom } from '../../atoms/avatar/avatar.component';
import { DividerAtom } from '../../atoms/divider/divider.component';
import { SearchBarMolecule } from '../../molecules/search-bar/search-bar.component';
import { ThemeService } from '../../../services/theme.service';
import { UserInfo } from '../../../models/organism.models';

@Component({
  selector: 'app-header-organism',
  standalone: true,
  imports: [CommonModule, ButtonAtom, AvatarAtom, DividerAtom, SearchBarMolecule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app-header.component.scss',
  host: {
    'role': 'banner',
  },
  template: `
    <header class="header">
      <!-- Left: hamburger + navigation -->
      <div class="header__left">
        <!-- Hamburger (mobile only) -->
        <ui-button
          class="header__hamburger"
          variant="icon"
          size="md"
          ariaLabel="Toggle sidebar"
          (clicked)="toggleSidebar.emit()"
        >
          <span class="material-icons">menu</span>
        </ui-button>

        <!-- Back / Forward -->
        <ui-button variant="icon" size="md" ariaLabel="Go back" (clicked)="goBack()">
          <span class="material-icons">arrow_back</span>
        </ui-button>
        <ui-button variant="icon" size="md" ariaLabel="Go forward" (clicked)="goForward()">
          <span class="material-icons">arrow_forward</span>
        </ui-button>
      </div>

      <!-- Center: search -->
      <div class="header__center">
        <ui-search-bar
          [placeholder]="searchPlaceholder()"
          (valueChange)="onSearch($event)"
        />
      </div>

      <!-- Right: theme toggle + user -->
      <div class="header__right">
        <!-- Dark mode toggle -->
        <button
          class="header__theme-toggle"
          (click)="themeService.toggle()"
          [attr.aria-label]="themeService.isDark() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
          title="Alternar modo oscuro"
        >
          @if (themeService.isDark()) {
            <span class="material-icons">light_mode</span>
          } @else {
            <span class="material-icons">dark_mode</span>
          }
        </button>

        @if (user(); as u) {
          <div class="header__user" #userArea>
            <button
              class="header__user-trigger"
              (click)="toggleDropdown()"
              [attr.aria-expanded]="dropdownOpen()"
              aria-haspopup="true"
              aria-label="User menu"
            >
              <ui-avatar
                [src]="u.avatarUrl || ''"
                [initials]="getInitials(u.name)"
                size="sm"
                [alt]="u.name"
              />
              <span class="header__user-name">{{ u.name }}</span>
              <span class="material-icons header__user-chevron" [class.header__user-chevron--open]="dropdownOpen()">
                expand_more
              </span>
            </button>

            <!-- Dropdown -->
            @if (dropdownOpen()) {
              <div class="header__dropdown" role="menu">
                <div class="header__dropdown-user">
                  <p class="header__dropdown-name">{{ u.name }}</p>
                  <p class="header__dropdown-email">{{ u.email }}</p>
                </div>
                <ui-divider />
                <button class="header__dropdown-item" role="menuitem" (click)="onProfile()">
                  <span class="material-icons">person</span>
                  <span>Perfil</span>
                </button>
                <button class="header__dropdown-item" role="menuitem" (click)="onSettings()">
                  <span class="material-icons">settings</span>
                  <span>Configuración</span>
                </button>
                <ui-divider />
                <button class="header__dropdown-item header__dropdown-item--danger" role="menuitem" (click)="onLogout()">
                  <span class="material-icons">logout</span>
                  <span>Cerrar sesión</span>
                </button>
              </div>
            }
          </div>
        }
      </div>
    </header>
  `
})
export class AppHeaderOrganism {
  user = input<UserInfo | null>(null);
  sidebarOpen = input(false);
  searchPlaceholder = input<string>('Buscar...');

  toggleSidebar = output<void>();
  logout = output<void>();
  navigateProfile = output<void>();
  navigateSettings = output<void>();

  dropdownOpen = signal(false);

  private elementRef = inject(ElementRef);
  protected themeService = inject(ThemeService);

  /* ── Navigation ── */
  goBack(): void {
    window.history.back();
  }

  goForward(): void {
    window.history.forward();
  }

  /* ── Search ── */
  onSearch(value: string): void {
    // Search handling — parent can bind to this or use SearchBarMolecule output
    // Currently handled by SearchBarMolecule valueChange
  }

  /* ── Dropdown ── */
  toggleDropdown(): void {
    this.dropdownOpen.update(v => !v);
  }

  onProfile(): void {
    this.dropdownOpen.set(false);
    this.navigateProfile.emit();
  }

  onSettings(): void {
    this.dropdownOpen.set(false);
    this.navigateSettings.emit();
  }

  onLogout(): void {
    this.dropdownOpen.set(false);
    this.logout.emit();
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  /* ── Click outside to close dropdown ── */
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (this.dropdownOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.dropdownOpen.set(false);
    }
  }
}
