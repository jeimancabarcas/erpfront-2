import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, tap, map } from 'rxjs';
import { PaginatedResponse, PaginatedMeta, QueryParams } from '../models/pagination.model';
import { Service, CreateServiceDto, UpdateServiceDto, ServiceActivity } from '../models/service.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/operational/servicios`;

  // Estado reactivo para los servicios
  private _services = signal<Service[]>([]);
  public services = this._services.asReadonly();

  // Estado reactivo para los metadatos de paginación
  private _meta = signal<PaginatedMeta | null>(null);
  public meta = this._meta.asReadonly();

  /**
   * Carga la lista completa de servicios desde el servidor con filtros, orden y paginación
   */
  loadServices(params?: QueryParams): Observable<any> {
    const queryParams: any = {};

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams[key] = params[key];
        }
      });
    }

    return this.http.get<any>(this.apiUrl, { params: queryParams }).pipe(
      tap((response: any) => {
        const data = response.data || response.items || (Array.isArray(response) ? response : []);
        const meta = response.meta || null;

        this._services.set(data);
        this._meta.set(meta);
      })
    );
  }

  /**
   * Obtiene un servicio por su ID
   */
  getServiceById(id: string): Observable<Service> {
    return this.http.get<Service>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea un nuevo servicio
   */
  createService(dto: CreateServiceDto): Observable<Service> {
    return this.http.post<Service>(this.apiUrl, dto).pipe(
      tap(newService => {
        this._services.update(items => [newService, ...items]);
      })
    );
  }

  /**
   * Actualiza un servicio existente
   */
  updateService(id: string, dto: UpdateServiceDto): Observable<Service> {
    return this.http.patch<Service>(`${this.apiUrl}/${id}`, dto).pipe(
      tap(updatedService => {
        this._services.update(items =>
          items.map(item => item.id === id ? updatedService : item)
        );
      })
    );
  }

  /**
   * Elimina un servicio
   */
  deleteService(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this._services.update(items => items.filter(item => item.id !== id));
      })
    );
  }

  /**
    * Gets activities associated with a service
    */
  getServiceActivities(serviceId: string): Observable<ServiceActivity[]> {
    return this.http.get<any>(`${this.apiUrl}/${serviceId}/actividades`).pipe(
      map((response: any) => {
        const data = response?.data || response?.actividades || response || [];
        return Array.isArray(data) ? data : [];
      })
    );
  }
}
