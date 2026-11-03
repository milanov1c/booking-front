import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="navbar">
      <div class="navbar-inner container">
        <a routerLink="/" class="brand">Booking</a>

        <nav class="links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Smeštaji</a>

          @if (auth.isLoggedIn()) {
            <a routerLink="/reservations" routerLinkActive="active">Moje rezervacije</a>
          }

          @if (auth.hasRole('Landlord', 'Admin')) {
            <a routerLink="/landlord" routerLinkActive="active">Landlord panel</a>
            <a routerLink="/landlord/properties" routerLinkActive="active">Nekretnine</a>
            <a routerLink="/landlord/reservations" routerLinkActive="active">Rezervacije gostiju</a>
          }

          @if (auth.hasRole('Admin')) {
            <a routerLink="/admin/users" routerLinkActive="active">Korisnici</a>
            <a routerLink="/admin/lookups" routerLinkActive="active">Šifarnici</a>
            <a routerLink="/admin/audit-log" routerLinkActive="active">Audit log</a>
          }
        </nav>

        <div class="actions">
          @if (auth.isLoggedIn()) {
            <a routerLink="/profile" routerLinkActive="active" class="profile-link">
              {{ auth.currentUser()?.firstName }}
            </a>
            <button class="btn-secondary btn-sm" (click)="logout()">Odjava</button>
          } @else {
            <a routerLink="/login" class="btn-secondary btn-sm">Prijava</a>
            <a routerLink="/register" class="btn btn-sm">Registracija</a>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      background: #fff;
      border-bottom: 1px solid var(--color-border);
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .navbar-inner {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding-top: 0.85rem;
      padding-bottom: 0.85rem;
      flex-wrap: wrap;
    }
    .brand {
      font-weight: 800;
      font-size: 1.3rem;
      letter-spacing: -0.5px;
      color: var(--color-primary);
    }
    .links {
      display: flex;
      gap: 1.1rem;
      flex: 1;
      flex-wrap: wrap;
    }
    .links a {
      color: var(--color-muted);
      font-weight: 700;
      font-size: 0.82rem;
      text-transform: uppercase;
      letter-spacing: 0.2px;
    }
    .links a.active {
      color: var(--color-primary);
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .profile-link {
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--color-text);
      margin-right: 0.3rem;
    }
  `],
})
export class NavbarComponent {
  constructor(readonly auth: AuthService, private readonly router: Router) {}

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
