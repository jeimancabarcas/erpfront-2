import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, tap, finalize, catchError, throwError } from 'rxjs';
import { PaginatedMeta, QueryParams } from '../models/pagination.model';
import { Activity, CreateActivityDto, UpdateActivityDto } from '../models/activity.model';

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/operational/actividades`;

  private _data = signal<Activity[]>([]);
  public data = this._data.asReadonly();

  private _meta = signal<PaginatedMeta | null>(null);
  public meta = this._meta.asReadonly();

  private _loading = signal(false);
  public loading = this._loading.asReadonly();

  private _error = signal<string | null>(null);
  public error = this._error.asReadonly();

  loadData(params?: QueryParams): Observable<any> {
    this._loading.set(true);
    this._error.set(null);

    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        const value = params[key];
        if (value !== undefined && value !== null && value !== '') {
          // Map frontend param names to backend param names
          const backendKey = key === 'name' ? 'nombre' : key;
          httpParams = httpParams.set(backendKey, String(value));
        }
      });
    }

    return this.http.get<any>(this.apiUrl, { params: httpParams }).pipe(
      tap((response: any) => {
        const data =
          response.data ||
          response.items ||
          (Array.isArray(response) ? response : []);
        const meta = response.meta || null;
        this._data.set(data);
        this._meta.set(meta);
      }),
      catchError((err) => {
        this._error.set(err.statusText || 'Error loading activities');
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false))
    );
  }

  /**
   * Crea una nueva actividad
   */
  createActivity(dto: CreateActivityDto): Observable<Activity> {
    return this.http.post<Activity>(this.apiUrl, dto).pipe(
      tap((newActivity: Activity) => {
        this._data.update(items => [newActivity, ...items]);
      })
    );
  }

  /**
   * Actualiza una actividad existente
   */
  updateActivity(id: string, dto: UpdateActivityDto): Observable<Activity> {
    return this.http.patch<Activity>(`${this.apiUrl}/${id}`, dto).pipe(
      tap((updatedActivity: Activity) => {
        this._data.update(items =>
          items.map(item => item.id === id ? updatedActivity : item)
        );
      })
    );
  }

  /**
   * Elimina una actividad
   */
  deleteActivity(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this._data.update(items => items.filter(item => item.id !== id));
      })
    );
  }
}
