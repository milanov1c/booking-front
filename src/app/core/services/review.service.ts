import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AddReviewDto, PagedResponse, ReviewDto, UpdateReviewDto } from '../models';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly baseUrl = `${environment.apiUrl}/Review`;

  constructor(private readonly http: HttpClient) {}

  add(dto: AddReviewDto): Observable<void> {
    return this.http.post<void>(this.baseUrl, dto);
  }

  update(dto: UpdateReviewDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${dto.id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getForProperty(propertyId: number, page = 1, pageSize = 20): Observable<PagedResponse<ReviewDto>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResponse<ReviewDto>>(`${this.baseUrl}/property/${propertyId}`, { params });
  }
}
