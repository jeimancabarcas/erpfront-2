import { Component, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-personal',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Nombres</mat-label>
          <input matInput [(ngModel)]="firstName" placeholder="Ej. John">
          <mat-icon matSuffix class="!text-gray-400">person</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Apellidos</mat-label>
          <input matInput [(ngModel)]="lastName" placeholder="Ej. Doe">
          <mat-icon matSuffix class="!text-gray-400">person</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Teléfono</mat-label>
          <input matInput [(ngModel)]="phone" placeholder="Ej. +57 300 000 0000">
          <mat-icon matSuffix class="!text-gray-400">phone</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Dirección</mat-label>
          <input matInput [(ngModel)]="address" placeholder="Ej. Calle 123 #45-67">
          <mat-icon matSuffix class="!text-gray-400">location_on</mat-icon>
        </mat-form-field>
      </div>

      <div class="flex justify-end pt-4">
        <button mat-flat-button color="primary" class="!px-8 !py-6 !rounded-xl !font-bold">
          Guardar Cambios
        </button>
      </div>
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
export class ProfilePersonalMolecule {
  firstName = signal('John');
  lastName = signal('Doe');
  phone = signal('+57 300 123 4567');
  address = signal('Carrera 10 #20-30, Bogotá');
}
