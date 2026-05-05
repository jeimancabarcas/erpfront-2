import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../../../components/templates/dashboard-layout/dashboard-layout.component';
import { BreadcrumbMolecule } from '../../../../components/molecules/breadcrumb/breadcrumb.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { TableContainerMolecule } from '../../../../components/molecules/table-container/table-container.component';
import { EmptyStateAtom } from '../../../../components/atoms/empty-state/empty-state.component';
import { CustomerService } from '../../../../services/customer.service';
import { Customer } from '../../../../models/customer.model';
import { CustomerDialogOrganism } from '../../../../components/organisms/customer-dialog/customer-dialog.component';
import { ConfirmDeleteDialogOrganism, ConfirmDeleteData } from '../../../../components/organisms/confirm-delete-dialog/confirm-delete-dialog.component';
import { QueryParams } from '../../../../models/pagination.model';

@Component({
  selector: 'app-sales-customers-page',
  standalone: true,
  imports: [
    CommonModule,
    DashboardLayoutComponent,
    BreadcrumbMolecule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatTooltipModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    TableContainerMolecule,
    EmptyStateAtom
  ],
  template: `
    <app-dashboard-layout>
      <app-breadcrumb 
        [items]="[
          { label: 'Ventas', link: '/sales' },
          { label: 'Clientes' }
        ]" 
      />

      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 mt-6">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Gestión de Clientes</h1>
          <p class="text-gray-500 font-medium">Administra la base de datos de tus clientes y su información de contacto.</p>
        </div>
        <button 
          mat-flat-button 
          color="primary" 
          (click)="openCustomerDialog()"
          class="!rounded-full !h-12 !px-6 !font-bold !bg-indigo-600 shadow-xl shadow-indigo-100 hover:scale-105 transition-all"
        >
          <mat-icon class="mr-2">person_add</mat-icon>
          Nuevo Cliente
        </button>
      </header>

      <!-- Barra de Filtros -->
      <div class="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <mat-form-field appearance="outline" class="w-full !mb-[-22px]">
            <mat-label>Nombre / Razón Social</mat-label>
            <input matInput [formControl]="nameFilter" placeholder="Buscar por nombre...">
            <mat-icon matPrefix class="!text-indigo-600 mr-2">search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full !mb-[-22px]">
            <mat-label>Documento</mat-label>
            <input matInput [formControl]="documentFilter" placeholder="Buscar por documento...">
            <mat-icon matPrefix class="!text-indigo-600 mr-2">badge</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full !mb-[-22px]">
            <mat-label>Estado</mat-label>
            <mat-select [formControl]="statusFilter">
              <mat-option [value]="''">Todos los estados</mat-option>
              <mat-option value="ACTIVE">Activo</mat-option>
              <mat-option value="INACTIVE">Inactivo</mat-option>
            </mat-select>
            <mat-icon matPrefix class="!text-indigo-600 mr-2">filter_list</mat-icon>
          </mat-form-field>
        </div>
      </div>

      <app-table-container [hasData]="true">
        <table mat-table [dataSource]="dataSource" matSort (matSortChange)="onSortChange($event)" class="w-full">
          <!-- ID Column -->
          <ng-container matColumnDef="document">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass">Identificación</th>
            <td mat-cell *matCellDef="let customer" [class]="cellClass">
              <div class="flex flex-col">
                <span class="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{{ customer.documentType }}</span>
                <span class="font-bold text-gray-900">{{ customer.documentNumber }}</span>
              </div>
            </td>
          </ng-container>

          <!-- Cliente Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass" mat-sort-header="name">Nombre / Razón Social</th>
            <td mat-cell *matCellDef="let customer" [class]="cellClass">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-indigo-600 border border-gray-100">
                  <mat-icon>person</mat-icon>
                </div>
                <div>
                  <div class="font-bold text-gray-900">{{ customer.name }}</div>
                  <div class="text-xs text-gray-400 font-medium">{{ customer.email }}</div>
                </div>
              </div>
            </td>
          </ng-container>

          <!-- Contacto Column -->
          <ng-container matColumnDef="contact">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass">Contacto</th>
            <td mat-cell *matCellDef="let customer" [class]="cellClass">
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2 text-xs text-gray-600">
                  <mat-icon class="!text-sm text-gray-400">phone</mat-icon>
                  {{ customer.phone || 'Sin teléfono' }}
                </div>
                <div class="flex items-center gap-2 text-xs text-gray-600">
                  <mat-icon class="!text-sm text-gray-400">location_on</mat-icon>
                  <span class="line-clamp-1">{{ customer.address || 'Sin dirección' }}</span>
                </div>
              </div>
            </td>
          </ng-container>

          <!-- Estado Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass" mat-sort-header="status">Estado</th>
            <td mat-cell *matCellDef="let customer" [class]="cellClass">
              <span 
                class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                [ngClass]="customer.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'"
              >
                {{ customer.status === 'ACTIVE' ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
          </ng-container>

          <!-- Acciones Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef [class]="headerClass"></th>
            <td mat-cell *matCellDef="let customer" [class]="cellClass">
              <div class="flex justify-end gap-2">
                <button 
                  mat-icon-button 
                  (click)="openCustomerDialog(customer)"
                  matTooltip="Editar cliente"
                  class="!text-gray-400 hover:!text-indigo-600 transition-all hover:bg-indigo-50"
                >
                  <mat-icon>edit</mat-icon>
                </button>
                <button 
                  mat-icon-button 
                  (click)="confirmDelete(customer)"
                  matTooltip="Eliminar cliente"
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
                icon="people"
                title="No se encontraron clientes"
                description="Aún no tienes clientes registrados o los filtros no coinciden con ninguna búsqueda."
              >
                <button 
                  mat-flat-button 
                  color="primary" 
                  (click)="openCustomerDialog()"
                  class="!rounded-full !h-12 !px-8 !font-bold !bg-indigo-600 shadow-lg shadow-indigo-100"
                >
                  <mat-icon class="mr-2">person_add</mat-icon>
                  Registrar Primer Cliente
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
          aria-label="Seleccionar página"
          class="!bg-transparent !border-t !border-gray-50"
        ></mat-paginator>
      </app-table-container>
    </app-dashboard-layout>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class SalesCustomersPageComponent implements OnInit {
  private dialog = inject(MatDialog);
  private customerService = inject(CustomerService);

  customers = this.customerService.customers;
  meta = this.customerService.meta;

  dataSource = new MatTableDataSource<Customer>([]);
  displayedColumns = ['document', 'name', 'contact', 'status', 'actions'];

  // Filtros
  nameFilter = new FormControl('');
  documentFilter = new FormControl('');
  statusFilter = new FormControl('');

  // Paginación y Orden
  pageSize = signal(10);
  pageIndex = signal(1);
  sortBy = signal('name');
  order = signal<'ASC' | 'DESC'>('ASC');

  headerClass = 'px-6 !py-6 !text-xs !font-black !text-gray-400 !uppercase !tracking-widest !border-b !border-gray-100';
  cellClass = 'px-6 !py-6 !text-sm !text-gray-600 !border-b !border-gray-100';

  constructor() {
    effect(() => {
      this.dataSource.data = this.customers();
    });
  }

  ngOnInit() {
    this.loadData();
    this.setupFilters();
  }

  setupFilters() {
    const filters = [this.nameFilter, this.documentFilter, this.statusFilter];
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
      documentNumber: this.documentFilter.value || '',
      status: this.statusFilter.value || ''
    };
    this.customerService.loadCustomers(params).subscribe();
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

  openCustomerDialog(customer?: Customer) {
    const dialogRef = this.dialog.open(CustomerDialogOrganism, {
      width: '700px',
      maxWidth: '95vw',
      data: { customer }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  confirmDelete(customer: Customer) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogOrganism, {
      width: '400px',
      maxWidth: '95vw',
      data: { 
        title: '¿Eliminar cliente?',
        message: 'Estás a punto de eliminar el cliente',
        itemName: customer.name,
        confirmText: 'Sí, eliminar definitivamente'
      } as ConfirmDeleteData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.customerService.deleteCustomer(customer.id).subscribe(() => this.loadData());
      }
    });
  }
}
