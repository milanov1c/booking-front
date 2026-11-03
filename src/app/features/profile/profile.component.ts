import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { UserProfileDto } from '../../core/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container">
      <h1>Moj profil</h1>

      @if (profile(); as p) {
        <div class="card section">
          <p><strong>{{ p.firstName }} {{ p.lastName }}</strong></p>
          <p class="muted">{{ p.email }}</p>
          <p class="muted">Uloga: {{ p.role }}</p>
        </div>

        <div class="card section">
          <h2>Promena lozinke</h2>
          <div class="form-row">
            <div class="form-field">
              <label>Trenutna lozinka</label>
              <input type="password" [(ngModel)]="oldPassword" name="oldPassword" />
            </div>
            <div class="form-field">
              <label>Nova lozinka</label>
              <input type="password" [(ngModel)]="newPassword" name="newPassword" />
            </div>
          </div>
          @if (passwordError()) {
            <p class="error-text">{{ passwordError() }}</p>
          }
          @if (passwordSuccess()) {
            <p class="success-text">Lozinka je uspešno promenjena.</p>
          }
          <button (click)="changePassword()" [disabled]="!oldPassword || !newPassword">Sačuvaj</button>
        </div>

        @if (p.role === 'Tenant') {
          <div class="section">
            <h2>Moje rezervacije ({{ p.reservations.length }})</h2>
            @if (p.reservations.length === 0) {
              <div class="empty-state">Još uvek nemate nijednu rezervaciju.</div>
            } @else {
              <table>
                <thead>
                  <tr><th>Smeštaj</th><th>Soba</th><th>Dolazak</th><th>Odlazak</th><th>Cena</th><th>Status</th></tr>
                </thead>
                <tbody>
                  @for (r of p.reservations; track r.id) {
                    <tr>
                      <td><a [routerLink]="['/properties', r.propertyId]">{{ r.propertyName }}</a></td>
                      <td>{{ r.propertyRoomName }}</td>
                      <td>{{ r.startDate | date: 'dd.MM.yyyy.' }}</td>
                      <td>{{ r.endDate | date: 'dd.MM.yyyy.' }}</td>
                      <td>{{ r.totalPrice | number: '1.0-2' }} €</td>
                      <td><span class="badge" [class]="'badge-' + r.status.toLowerCase()">{{ r.status }}</span></td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </div>

          <div class="section">
            <h2>Moje ocene ({{ p.reviews.length }})</h2>
            @if (p.reviews.length === 0) {
              <div class="empty-state">Još uvek niste ostavili nijednu ocenu.</div>
            } @else {
              @for (review of p.reviews; track review.id) {
                <div class="card" style="margin-bottom: 0.6rem;">
                  <div class="flex-between">
                    <a [routerLink]="['/properties', review.propertyId]">{{ review.propertyName }}</a>
                    <span>★ {{ review.rating }}/5</span>
                  </div>
                  <p style="margin: 0.35rem 0 0;">{{ review.comment }}</p>
                  <p class="muted" style="font-size: 0.8rem; margin: 0.35rem 0 0;">{{ review.createdAt | date: 'dd.MM.yyyy.' }}</p>
                </div>
              }
            }
          </div>
        }

        @if ((p.ownedProperties ?? []).length > 0) {
          <div class="section">
            <h2>Moje nekretnine ({{ p.ownedProperties.length }})</h2>
            <div class="grid-cards">
              @for (property of p.ownedProperties; track property.id) {
                <a [routerLink]="['/properties', property.id]" class="card" style="display:block; color: inherit;">
                  <h3>{{ property.name }}</h3>
                  <p class="muted">{{ property.city }}, {{ property.country }}</p>
                </a>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  profile = signal<UserProfileDto | null>(null);
  oldPassword = '';
  newPassword = '';
  passwordError = signal('');
  passwordSuccess = signal(false);

  constructor(private readonly userService: UserService, private readonly authService: AuthService) {}

  ngOnInit(): void {
    this.userService.getProfile().subscribe((p) => this.profile.set(p));
  }

  changePassword(): void {
    this.passwordError.set('');
    this.passwordSuccess.set(false);
    this.authService.changePassword({ oldPassword: this.oldPassword, newPassword: this.newPassword }).subscribe({
      next: () => {
        this.passwordSuccess.set(true);
        this.oldPassword = '';
        this.newPassword = '';
      },
      error: () => this.passwordError.set('Promena lozinke nije uspela. Proverite trenutnu lozinku.'),
    });
  }
}
