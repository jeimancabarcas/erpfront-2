import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Customer } from '../../../models/customer.model';

@Component({
  selector: 'app-customer-info-molecule',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDividerModule],
  template: `
    <div class="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 p-8 shadow-sm dark:shadow-none flex flex-col">
      <div class="flex flex-col items-center text-center space-y-4 mb-8">
        <div class="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-[32px] flex items-center justify-center shadow-inner transition-transform hover:scale-105 duration-300">
          <mat-icon class="!text-[48px] !w-12 !h-12">person</mat-icon>
        </div>
        <div>
          <h2 class="text-2xl font-black text-gray-900 dark:text-gray-100 leading-tight">{{ customer.name }}</h2>
          <p class="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">
            {{ customer.documentType }}: {{ customer.documentNumber }}
          </p>
        </div>
      </div>

      <mat-divider></mat-divider>

      <div class="py-6 space-y-5 flex-grow">
        <div class="flex items-start gap-4 group">
          <div class="w-10 h-10 bg-gray-50 dark:bg-gray-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 rounded-xl flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            <mat-icon>email</mat-icon>
          </div>
          <div>
            <p class="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest">Email</p>
            <p class="text-sm font-bold text-gray-700 dark:text-gray-300 break-all">{{ customer.email }}</p>
          </div>
        </div>

        <div class="flex items-start gap-4 group">
          <div class="w-10 h-10 bg-gray-50 dark:bg-gray-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 rounded-xl flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            <mat-icon>phone</mat-icon>
          </div>
          <div>
            <p class="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest">Teléfono</p>
            <p class="text-sm font-bold text-gray-700 dark:text-gray-300">{{ customer.phone || 'No registrado' }}</p>
          </div>
        </div>

        <div class="flex items-start gap-4 group">
          <div class="w-10 h-10 bg-gray-50 dark:bg-gray-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 rounded-xl flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            <mat-icon>location_on</mat-icon>
          </div>
          <div>
            <p class="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest">Dirección</p>
            <p class="text-sm font-bold text-gray-700 dark:text-gray-300 line-clamp-2">{{ customer.address || 'No registrada' }}</p>
          </div>
        </div>
      </div>

      <div class="pt-6 mt-auto">
        <div class="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl border border-emerald-100 dark:border-emerald-800 flex items-center justify-between">
          <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest">Estado</span>
          <span 
            class="px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-sm border"
            [ngClass]="customer.status === 'ACTIVE' ? 'bg-white text-emerald-600 border-emerald-100 dark:bg-gray-900 dark:text-emerald-400 dark:border-emerald-800' : 'bg-gray-100 text-gray-400 border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700'"
          >
            {{ customer.status === 'ACTIVE' ? 'Activo' : 'Inactivo' }}
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
  `]
})
export class CustomerInfoMolecule {
  @Input({ required: true }) customer!: Customer;
}
