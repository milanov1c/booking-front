import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AddReservationDto,
  CancelReservationDto,
  ConfirmReservationDto,
  GetUserReservationsQuery,
  LandlordReservationDto,
  PagedResponse,
  ReservationDto,
} from '../models';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly baseUrl = `${environment.apiUrl}/Reservation`;

  constructor(private readonly http: HttpClient) {}

  create(dto: AddReservationDto): Observable<void> {
    return this.http.post<void>(this.baseUrl, dto);
  }

  getMine(query: GetUserReservationsQuery): Observable<PagedResponse<ReservationDto>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.pageSize) params = params.set('pageSize', query.pageSize);
    return this.http.get<PagedResponse<ReservationDto>>(this.baseUrl, { params });
  }

  getForLandlord(): Observable<LandlordReservationDto[]> {
    return this.http.get<LandlordReservationDto[]>(`${this.baseUrl}/landlord`);
  }

  confirm(dto: ConfirmReservationDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/confirm`, dto);
  }

  cancel(dto: CancelReservationDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/cancel`, dto);
  }
}
