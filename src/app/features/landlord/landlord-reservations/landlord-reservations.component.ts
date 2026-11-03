import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ReservationService } from '../../../core/services/reservation.service';
import { LandlordReservationDto } from '../../../core/models';

@Component({
  selector: 'app-landlord-reservations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Rezervacije gostiju</h1>

      @if (error()) {
        <p class="error-text">{{ error() }}</p>
      }

      @if (reservations().length === 0) {
        <div class="empty-state">Nema rezervacija za vaše nekretnine.</div>
      } @else {
        <table>
          <thead>
            <tr>
              <th>Nekretnina</th>
              <th>Gost</th>
              <th>Soba</th>
              <th>Dolazak</th>
              <th>Odlazak</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (r of reservations(); track r.id) {
              <tr>
                <td>{{ r.name }}</td>
                <td>{{ r.tenant }}</td>
                <td>{{ r.propertyRoomName }}</td>
                <td>{{ r.startDate | date: 'dd.MM.yyyy.' }}</td>
                <td>{{ r.endDate | date: 'dd.MM.yyyy.' }}</td>
                <td><span class="badge" [class]="'badge-' + r.status.toLowerCase()">{{ r.status }}</span></td>
                <td>
                  @if (r.status === 'Pending') {
                    <button class="btn-sm" [disabled]="confirming() === r.id" (click)="confirm(r)">
                      {{ confirming() === r.id ? 'Potvrđujem...' : 'Prihvati' }}
                    </button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
})
export class LandlordReservationsComponent implements OnInit {
  reservations = signal<LandlordReservationDto[]>([]);
  confirming = signal<number | null>(null);
  error = signal('');

  constructor(private readonly reservationService: ReservationService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.reservationService.getForLandlord().subscribe((data) => this.reservations.set(data));
  }

  confirm(reservation: LandlordReservationDto): void {
    this.error.set('');
    this.confirming.set(reservation.id);
    this.reservationService.confirm({ reservationId: reservation.id }).subscribe({
      next: () => {
        this.confirming.set(null);
        this.load();
      },
      error: () => {
        this.confirming.set(null);
        this.error.set('Prihvatanje rezervacije nije uspelo.');
      },
    });
  }
}
