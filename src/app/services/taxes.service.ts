import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, tap, finalize, catchError, throwError } from 'rxjs';
import { PaginatedMeta, QueryParams } from '../models/pagination.model';
import { Tax } from '../models/tax.model';

@Injectable({
  providedIn: 'root',
})
export class TaxesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/settings/taxes`;

  private _data = signal<Tax[]>([]);
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
          httpParams = httpParams.set(key, String(value));
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
        this._error.set(err.statusText || 'Error loading taxes');
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false))
    );
  }
}
