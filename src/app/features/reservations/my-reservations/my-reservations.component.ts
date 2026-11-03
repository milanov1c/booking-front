import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReservationService } from '../../../core/services/reservation.service';
import { ReservationDto } from '../../../core/models';
import { PaginatorComponent } from '../../../shared/paginator/paginator.component';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginatorComponent],
  template: `
    <div class="container">
      <h1>Moje rezervacije</h1>

      @if (reservations().length === 0) {
        <div class="empty-state">Nemate nijednu rezervaciju.</div>
      } @else {
        <table>
          <thead>
            <tr>
              <th>Smeštaj</th>
              <th>Soba</th>
              <th>Dolazak</th>
              <th>Odlazak</th>
              <th>Cena</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (r of reservations(); track r.id) {
              <tr>
                <td><a [routerLink]="['/properties', r.propertyId]">{{ r.propertyName }}</a></td>
                <td>{{ r.propertyRoomName }}</td>
                <td>{{ r.startDate | date: 'dd.MM.yyyy.' }}</td>
                <td>{{ r.endDate | date: 'dd.MM.yyyy.' }}</td>
                <td>{{ r.totalPrice | number: '1.0-2' }} €</td>
                <td><span class="badge" [class]="statusClass(r.status)">{{ r.status }}</span></td>
                <td>
                  @if (r.status === 'Pending') {
                    <button class="btn-danger btn-sm" (click)="cancel(r)">Otkaži</button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
        <app-paginator [page]="page()" [totalPages]="totalPages()" (pageChange)="load($event)"></app-paginator>
      }
    </div>
  `,
})
export class MyReservationsComponent implements OnInit {
  reservations = signal<ReservationDto[]>([]);
  page = signal(1);
  totalPages = signal(1);

  constructor(private readonly reservationService: ReservationService) {}

  ngOnInit(): void {
    this.load(1);
  }

  load(page: number): void {
    this.reservationService.getMine({ page, pageSize: 10 }).subscribe((result) => {
      this.reservations.set(result.items);
      this.page.set(result.page);
      this.totalPages.set(result.totalPages || 1);
    });
  }

  cancel(reservation: ReservationDto): void {
    this.reservationService.cancel({ reservationId: reservation.id }).subscribe(() => this.load(this.page()));
  }

  statusClass(status: string): string {
    return `badge-${status.toLowerCase()}`;
  }
}
