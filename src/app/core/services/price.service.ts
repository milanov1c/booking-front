import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AttachPriceDto, PagedResponse, PropertyRoomPriceDto, UpdatePropertyRoomPriceDto } from '../models';

@Injectable({ providedIn: 'root' })
export class PriceService {
  private readonly baseUrl = `${environment.apiUrl}/price`;

  constructor(private readonly http: HttpClient) {}

  getForRoom(propertyRoomId: number, page = 1, pageSize = 10): Observable<PagedResponse<PropertyRoomPriceDto>> {
    const params = new HttpParams()
      .set('propertyRoomId', propertyRoomId)
      .set('page', page)
      .set('pageSize', pageSize);
    return this.http.get<PagedResponse<PropertyRoomPriceDto>>(this.baseUrl, { params });
  }

  attach(dto: AttachPriceDto): Observable<void> {
    return this.http.post<void>(this.baseUrl, dto);
  }

  update(dto: UpdatePropertyRoomPriceDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${dto.id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
