import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { LandlordStatsDto } from '../../../core/models';

@Component({
  selector: 'app-landlord-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <h1>Landlord panel</h1>

      <div class="flex-between section">
        <a routerLink="/landlord/properties" class="btn">Moje nekretnine</a>
        <a routerLink="/landlord/reservations" class="btn btn-secondary">Rezervacije gostiju</a>
      </div>

      @if (stats(); as s) {
        <div class="grid-cards">
          <div class="card"><p class="muted">Nekretnine</p><h2>{{ s.totalProperties }}</h2></div>
          <div class="card"><p class="muted">Sobe</p><h2>{{ s.totalPropertyRooms }}</h2></div>
          <div class="card"><p class="muted">Ukupno rezervacija</p><h2>{{ s.totalReservations }}</h2></div>
          <div class="card"><p class="muted">Potvrđene</p><h2>{{ s.confirmedReservations }}</h2></div>
          <div class="card"><p class="muted">Na čekanju</p><h2>{{ s.pendingReservations }}</h2></div>
          <div class="card"><p class="muted">Otkazane</p><h2>{{ s.cancelledReservations }}</h2></div>
          <div class="card"><p class="muted">Ukupan prihod</p><h2>{{ s.totalRevenue | number: '1.0-2' }} €</h2></div>
          @if (s.averageRating) {
            <div class="card"><p class="muted">Prosečna ocena</p><h2>★ {{ s.averageRating | number: '1.1-1' }}</h2></div>
          }
        </div>
      }
    </div>
  `,
})
export class LandlordDashboardComponent implements OnInit {
  stats = signal<LandlordStatsDto | null>(null);

  constructor(private readonly userService: UserService) {}

  ngOnInit(): void {
    this.userService.getLandlordStats().subscribe((s) => this.stats.set(s));
  }
}
