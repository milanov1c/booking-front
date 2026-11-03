import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  GetUsersSearchDto,
  LandlordStatsDto,
  PagedResponse,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
  UserListItemDto,
  UserProfileDto,
} from '../models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly baseUrl = `${environment.apiUrl}/User`;

  constructor(private readonly http: HttpClient) {}

  getProfile(): Observable<UserProfileDto> {
    return this.http.get<UserProfileDto>(`${this.baseUrl}/profile`);
  }

  search(query: GetUsersSearchDto): Observable<PagedResponse<UserListItemDto>> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<PagedResponse<UserListItemDto>>(this.baseUrl, { params });
  }

  updateRole(id: number, dto: UpdateUserRoleDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/role`, dto);
  }

  updateStatus(id: number, dto: UpdateUserStatusDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/status`, dto);
  }

  getLandlordStats(): Observable<LandlordStatsDto> {
    return this.http.get<LandlordStatsDto>(`${this.baseUrl}/landlord/stats`);
  }
}
