import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../../../components/templates/dashboard-layout/dashboard-layout.component';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BreadcrumbMolecule } from '../../../../components/molecules/breadcrumb/breadcrumb.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { TableContainerMolecule } from '../../../../components/molecules/table-container/table-container.component';
import { EmptyStateAtom } from '../../../../components/atoms/empty-state/empty-state.component';
import { SupplierService } from '../../../../services/supplier.service';
import { Supplier } from '../../../../models/supplier.model';
import { SupplierDialogOrganism } from '../../../../components/organisms/supplier-dialog/supplier-dialog.component';
import { ConfirmDeleteDialogOrganism, ConfirmDeleteData } from '../../../../components/organisms/confirm-delete-dialog/confirm-delete-dialog.component';
import { QueryParams } from '../../../../models/pagination.model';

@Component({
  selector: 'app-inventory-suppliers-page',
  standalone: true,
  imports: [
    CommonModule,
    DashboardLayoutComponent,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    BreadcrumbMolecule,
    TableContainerMolecule,
    EmptyStateAtom
  ],
  template: `
    <app-dashboard-layout>
      <app-breadcrumb 
        [items]="[
          { label: 'Inventario', link: '/inventory' },
          { label: 'Configuración', link: '/inventory' },
          { label: 'Proveedores' }
        ]" 
      />

      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 mt-6">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Proveedores</h1>
          <p class="text-gray-500 font-medium">Administra tus socios comerciales y fuentes de suministro.</p>
        </div>
        <button 
          mat-flat-button 
          color="primary" 
          (click)="openSupplierDialog()"
          class="!rounded-full !h-12 !px-6 !font-bold !bg-indigo-600 shadow-xl shadow-indigo-100 hover:scale-105 transition-all"
        >
          <mat-icon class="mr-2">add</mat-icon>
          Nuevo Proveedor
        </button>
      </header>

      <!-- Barra de Filtros -->
      <div class="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <mat-form-field appearance="outline" class="w-full !mb-[-22px]">
            <mat-label>Nombre del Proveedor</mat-label>
            <input matInput [formControl]="nameFilter" placeholder="Buscar por nombre...">
            <mat-icon matPrefix class="!text-indigo-600 mr-2">search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full !mb-[-22px]">
            <mat-label>NIT / Identificación</mat-label>
            <input matInput [formControl]="nitFilter" placeholder="Buscar por NIT...">
            <mat-icon matPrefix class="!text-indigo-600 mr-2">fingerprint</mat-icon>
          </mat-form-field>
        </div>
      </div>

      <app-table-container [hasData]="true">
        <table mat-table [dataSource]="dataSource" matSort (matSortChange)="onSortChange($event)" class="w-full">
          
          <!-- NIT Column -->
          <ng-container matColumnDef="nit">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass" mat-sort-header="nit">NIT</th>
            <td mat-cell *matCellDef="let supplier" [class]="cellClass">
              <span class="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {{ supplier.nit }}
              </span>
            </td>
          </ng-container>

          <!-- Nombre Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass" mat-sort-header="name">Nombre</th>
            <td mat-cell *matCellDef="let supplier" [class]="cellClass">
              <div class="font-bold text-gray-900">{{ supplier.name }}</div>
            </td>
          </ng-container>

          <!-- Dirección Column -->
          <ng-container matColumnDef="address">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass">Dirección</th>
            <td mat-cell *matCellDef="let supplier" [class]="cellClass">
              <div class="flex items-center gap-2">
                <mat-icon class="!text-gray-400 !text-sm">location_on</mat-icon>
                <span class="text-xs truncate max-w-[200px]">{{ supplier.address }}</span>
              </div>
            </td>
          </ng-container>

          <!-- Teléfono Column -->
          <ng-container matColumnDef="phone">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass">Teléfono</th>
            <td mat-cell *matCellDef="let supplier" [class]="cellClass">
              <div class="flex items-center gap-2">
                <mat-icon class="!text-gray-400 !text-sm">phone</mat-icon>
                <span class="text-xs font-bold">{{ supplier.phone }}</span>
              </div>
            </td>
          </ng-container>

          <!-- Acciones Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass"></th>
            <td mat-cell *matCellDef="let supplier" [class]="cellClass">
              <div class="flex justify-end gap-2">
                <button 
                  mat-icon-button 
                  (click)="openSupplierDialog(supplier)"
                  class="!text-gray-400 hover:!text-indigo-600 transition-all hover:bg-indigo-50"
                >
                  <mat-icon>edit</mat-icon>
                </button>
                <button 
                  mat-icon-button 
                  (click)="confirmDelete(supplier)"
                  class="!text-gray-400 hover:!text-red-600 transition-all hover:bg-red-50"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-50/50 transition-colors"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell p-12 text-center" [attr.colspan]="displayedColumns.length">
              <app-empty-state 
                icon="business"
                title="No se encontraron proveedores"
                description="Aún no has registrado proveedores en tu sistema o los filtros aplicados no coinciden."
              >
                <button 
                  mat-flat-button 
                  color="primary" 
                  (click)="openSupplierDialog()"
                  class="!rounded-full !h-12 !px-8 !font-bold !bg-indigo-600 shadow-lg shadow-indigo-100"
                >
                  <mat-icon class="mr-2">add</mat-icon>
                  Registrar Primer Proveedor
                </button>
              </app-empty-state>
            </td>
          </tr>
        </table>

        <mat-paginator 
          [length]="meta()?.total || 0"
          [pageSize]="pageSize()"
          [pageIndex]="pageIndex() - 1"
          [pageSizeOptions]="[5, 10, 25, 100]"
          (page)="onPageChange($event)"
          class="!bg-transparent !border-t !border-gray-50"
        ></mat-paginator>
      </app-table-container>
    </app-dashboard-layout>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class InventorySuppliersPageComponent implements OnInit {
  private supplierService = inject(SupplierService);
  private dialog = inject(MatDialog);

  suppliers = this.supplierService.suppliers;
  meta = this.supplierService.meta;

  dataSource = new MatTableDataSource<Supplier>([]);
  
  nameFilter = new FormControl('');
  nitFilter = new FormControl('');

  pageSize = signal(10);
  pageIndex = signal(1);
  sortBy = signal('name');
  order = signal<'ASC' | 'DESC'>('ASC');

  displayedColumns = ['nit', 'name', 'address', 'phone', 'actions'];
  headerClass = 'px-6 !py-6 !text-xs !font-black !text-gray-400 !uppercase !tracking-widest !border-b !border-gray-100';
  cellClass = 'px-6 !py-6 !text-sm !text-gray-600 !border-b !border-gray-100';

  constructor() {
    effect(() => {
      this.dataSource.data = this.suppliers();
    });
  }

  ngOnInit() {
    this.loadData();
    this.setupFilters();
  }

  setupFilters() {
    const filters = [this.nameFilter, this.nitFilter];
    filters.forEach(control => {
      control.valueChanges.pipe(
        debounceTime(400),
        distinctUntilChanged()
      ).subscribe(() => {
        this.pageIndex.set(1);
        this.loadData();
      });
    });
  }

  loadData() {
    const params: QueryParams = {
      page: this.pageIndex(),
      limit: this.pageSize(),
      sortBy: this.sortBy(),
      order: this.order(),
      name: this.nameFilter.value || '',
      nit: this.nitFilter.value || ''
    };
    this.supplierService.loadSuppliers(params).subscribe();
  }

  onPageChange(event: PageEvent) {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex + 1);
    this.loadData();
  }

  onSortChange(sort: Sort) {
    this.sortBy.set(sort.active);
    this.order.set(sort.direction === 'desc' ? 'DESC' : 'ASC');
    this.loadData();
  }

  openSupplierDialog(supplier?: Supplier) {
    const dialogRef = this.dialog.open(SupplierDialogOrganism, {
      width: '600px',
      maxWidth: '95vw',
      data: { supplier }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  confirmDelete(supplier: Supplier) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogOrganism, {
      width: '400px',
      maxWidth: '95vw',
      data: { 
        title: '¿Eliminar proveedor?',
        message: 'Estás a punto de eliminar al proveedor',
        itemName: supplier.name,
        confirmText: 'Sí, eliminar definitivamente'
      } as ConfirmDeleteData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.supplierService.deleteSupplier(supplier.id).subscribe(() => this.loadData());
      }
    });
  }
}
