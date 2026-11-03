import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PagedResponse,
  PropertyDto,
  PropertyListItemDto,
  PropertySearchDto,
  PropertyTypeDto,
  UpdatePropertyDto,
} from '../models';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private readonly baseUrl = `${environment.apiUrl}/Property`;

  constructor(private readonly http: HttpClient) {}

  search(query: PropertySearchDto): Observable<PagedResponse<PropertyListItemDto>> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<PagedResponse<PropertyListItemDto>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<PropertyDto> {
    return this.http.get<PropertyDto>(`${this.baseUrl}/${id}`);
  }

  create(form: {
    name: string;
    description: string;
    address: string;
    propertyTypeId: number;
    destinationId: number;
    image: File;
    landlordId?: number;
  }): Observable<void> {
    const formData = new FormData();
    formData.append('Name', form.name);
    formData.append('Description', form.description);
    formData.append('Address', form.address);
    formData.append('PropertyTypeId', String(form.propertyTypeId));
    formData.append('DestinationId', String(form.destinationId));
    formData.append('Image', form.image);
    // Only honored by the API when the caller is an Admin (a Landlord is
    // always forced to own what they create); Admins act as their own
    // landlord here unless they explicitly pick someone else.
    if (form.landlordId) {
      formData.append('LandlordId', String(form.landlordId));
    }
    return this.http.post<void>(this.baseUrl, formData);
  }

  attachImages(propertyId: number, images: File[]): Observable<void> {
    const formData = new FormData();
    formData.append('PropertyId', String(propertyId));
    images.forEach((image) => formData.append('Images', image));
    return this.http.post<void>(`${this.baseUrl}/attach`, formData);
  }

  update(dto: UpdatePropertyDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${dto.id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getPropertyTypes(): Observable<PropertyTypeDto[]> {
    return this.http.get<PropertyTypeDto[]>(`${environment.apiUrl}/PropertyType`);
  }
}
