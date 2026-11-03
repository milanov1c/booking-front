import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuditLogDto, AuditLogSearchDto, PagedResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private readonly baseUrl = `${environment.apiUrl}/AuditLog`;

  constructor(private readonly http: HttpClient) {}

  search(query: AuditLogSearchDto): Observable<PagedResponse<AuditLogDto>> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<PagedResponse<AuditLogDto>>(this.baseUrl, { params });
  }
}
