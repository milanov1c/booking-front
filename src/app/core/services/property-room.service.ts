import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PropertyRoomAvailabilityDto,
  PropertyRoomDto,
  UpdatePropertyRoomDto,
} from '../models';

@Injectable({ providedIn: 'root' })
export class PropertyRoomService {
  private readonly baseUrl = `${environment.apiUrl}/PropertyRoom`;

  constructor(private readonly http: HttpClient) {}

  getById(id: number): Observable<PropertyRoomDto> {
    return this.http.get<PropertyRoomDto>(`${this.baseUrl}/${id}`);
  }

  checkAvailability(id: number, startDate: string, endDate: string): Observable<PropertyRoomAvailabilityDto> {
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate);
    return this.http.get<PropertyRoomAvailabilityDto>(`${this.baseUrl}/${id}/availability`, { params });
  }

  create(form: { name: string; capacity: number; propertyId: number; image: File }): Observable<void> {
    const formData = new FormData();
    formData.append('Name', form.name);
    formData.append('Capacity', String(form.capacity));
    formData.append('PropertyId', String(form.propertyId));
    formData.append('Image', form.image);
    return this.http.post<void>(this.baseUrl, formData);
  }

  attachImages(propertyRoomId: number, images: File[]): Observable<void> {
    const formData = new FormData();
    formData.append('PropertyRoomId', String(propertyRoomId));
    images.forEach((image) => formData.append('Images', image));
    return this.http.post<void>(`${this.baseUrl}/attach`, formData);
  }

  update(dto: UpdatePropertyRoomDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${dto.id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
