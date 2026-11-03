import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AddAmenityDto,
  AddCountryDto,
  AddDestinationDto,
  AddRoleDto,
  AddUseCaseDto,
  AmenityDto,
  AttachAmenityDto,
  AttachUseCaseDto,
  CountryDto,
  DestinationDto,
  RoleListItemDto,
  UseCaseListItemDto,
} from '../models';

@Injectable({ providedIn: 'root' })
export class LookupService {
  constructor(private readonly http: HttpClient) {}

  // Amenities
  getAmenities(): Observable<AmenityDto[]> {
    return this.http.get<AmenityDto[]>(`${environment.apiUrl}/Amenity`);
  }

  addAmenity(dto: AddAmenityDto): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/Amenity`, dto);
  }

  attachAmenity(dto: AttachAmenityDto): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/Amenity/attach`, dto);
  }

  detachAmenity(propertyId: number, amenityId: number): Observable<void> {
    const params = new HttpParams().set('propertyId', propertyId).set('amenityId', amenityId);
    return this.http.delete<void>(`${environment.apiUrl}/Amenity/detach`, { params });
  }

  // Countries
  getCountries(): Observable<CountryDto[]> {
    return this.http.get<CountryDto[]>(`${environment.apiUrl}/Country`);
  }

  addCountry(dto: AddCountryDto): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/Country`, dto);
  }

  // Destinations
  getDestinations(): Observable<DestinationDto[]> {
    return this.http.get<DestinationDto[]>(`${environment.apiUrl}/Destination`);
  }

  addDestination(dto: AddDestinationDto): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/Destination`, dto);
  }

  // Roles
  getRoles(): Observable<RoleListItemDto[]> {
    return this.http.get<RoleListItemDto[]>(`${environment.apiUrl}/Role`);
  }

  addRole(dto: AddRoleDto): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/Role`, dto);
  }

  // Use cases (fine-grained permissions)
  getUseCases(): Observable<UseCaseListItemDto[]> {
    return this.http.get<UseCaseListItemDto[]>(`${environment.apiUrl}/UseCase`);
  }

  addUseCase(dto: AddUseCaseDto): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/UseCase`, dto);
  }

  attachUseCase(dto: AttachUseCaseDto): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/UseCase/attach`, dto);
  }

  detachUseCase(roleId: number, useCaseId: number): Observable<void> {
    const params = new HttpParams().set('roleId', roleId).set('useCaseId', useCaseId);
    return this.http.delete<void>(`${environment.apiUrl}/UseCase/detach`, { params });
  }
}
