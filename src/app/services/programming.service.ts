import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, tap, map } from 'rxjs';
import { PaginatedMeta, QueryParams } from '../models/pagination.model';
import {
  ServicioProgramado,
  CreateProgramadoDto,
  QueryProgramadosDto,
  ChangeStateDto,
  CancelDto,
} from '../models/programming.model';

@Injectable({
  providedIn: 'root'
})
export class ProgrammingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/operational/servicio-programados`;

  // Estado reactivo para los servicios programados
  private _data = signal<ServicioProgramado[]>([]);
  public data = this._data.asReadonly();

  // Estado reactivo para los metadatos de paginación
  private _meta = signal<PaginatedMeta | null>(null);
  public meta = this._meta.asReadonly();

  // Estado de carga
  private _loading = signal(false);
  public loading = this._loading.asReadonly();

  /**
   * Carga la lista de servicios programados con filtros y paginación
   */
  loadProgramados(params?: QueryParams): Observable<any> {
    this._loading.set(true);

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

        this._data.set(data);
        this._meta.set(meta);
        this._loading.set(false);
      }),
      map(() => (_response: any) => _response)
    );
  }

  /**
   * Obtiene un servicio programado por su ID
   */
  getProgramadoById(id: string): Observable<ServicioProgramado> {
    return this.http.get<ServicioProgramado>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea un nuevo servicio programado
   */
  createProgramado(dto: CreateProgramadoDto): Observable<ServicioProgramado> {
    return this.http.post<ServicioProgramado>(this.apiUrl, dto).pipe(
      tap(newProgramado => {
        this._data.update(items => [newProgramado, ...items]);
      })
    );
  }

  /**
   * Cambia el estado de un servicio programado
   */
  changeState(id: string, dto: ChangeStateDto): Observable<ServicioProgramado> {
    return this.http.patch<ServicioProgramado>(`${this.apiUrl}/${id}/state`, dto).pipe(
      tap(updatedProgramado => {
        this._data.update(items =>
          items.map(item => item.id === id ? updatedProgramado : item)
        );
      })
    );
  }

  /**
   * Cancela un servicio programado
   */
  cancelProgramado(id: string, dto: CancelDto): Observable<ServicioProgramado> {
    return this.http.post<ServicioProgramado>(`${this.apiUrl}/${id}/cancel`, dto).pipe(
      tap(cancelledProgramado => {
        this._data.update(items =>
          items.map(item => item.id === id ? cancelledProgramado : item)
        );
      })
    );
  }
}
