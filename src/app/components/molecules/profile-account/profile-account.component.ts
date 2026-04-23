import { Component, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-account',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatDividerModule, FormsModule],
  template: `
    <div class="space-y-8">
      <!-- Email Section -->
      <section>
        <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <mat-icon class="!text-indigo-600">alternate_email</mat-icon>
          Correo Electrónico
        </h3>
        <div class="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <mat-form-field appearance="outline" class="w-full max-w-md">
            <mat-label>Email Actual</mat-label>
            <input matInput [(ngModel)]="email" type="email">
          </mat-form-field>
          <button mat-stroked-button class="!rounded-xl !py-6 !font-bold !border-gray-200">
            Actualizar Email
          </button>
        </div>
      </section>

      <mat-divider></mat-divider>

      <!-- Password Section -->
      <section>
        <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <mat-icon class="!text-indigo-600">lock</mat-icon>
          Cambiar Contraseña
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Contraseña Anterior</mat-label>
            <input matInput [type]="hideOld ? 'password' : 'text'" [(ngModel)]="oldPassword">
            <button mat-icon-button matSuffix (click)="hideOld = !hideOld">
              <mat-icon>{{hideOld ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
          </mat-form-field>

          <div class="hidden md:block"></div>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Nueva Contraseña</mat-label>
            <input matInput [type]="hideNew ? 'password' : 'text'" [(ngModel)]="newPassword">
            <button mat-icon-button matSuffix (click)="hideNew = !hideNew">
              <mat-icon>{{hideNew ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Confirmar Nueva Contraseña</mat-label>
            <input matInput [type]="hideConfirm ? 'password' : 'text'" [(ngModel)]="confirmPassword">
            <button mat-icon-button matSuffix (click)="hideConfirm = !hideConfirm">
              <mat-icon>{{hideConfirm ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
          </mat-form-field>
        </div>

        <div class="flex justify-end pt-4">
          <button mat-flat-button color="primary" class="!px-8 !py-6 !rounded-xl !font-bold">
            Actualizar Contraseña
          </button>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }
  `]
})
export class ProfileAccountMolecule {
  email = signal('admin@erp.com');
  oldPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');

  hideOld = true;
  hideNew = true;
  hideConfirm = true;
}
