import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RoleListItemDto } from '../../../core/models';

const ROLE_LABELS: Record<string, string> = {
  Tenant: 'Gost (rezervišem smeštaj)',
  Landlord: 'Vlasnik smeštaja (izdajem smeštaj)',
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container" style="max-width: 460px;">
      <div class="card">
        <h2>Registracija</h2>
        <form (ngSubmit)="submit()" #form="ngForm">
          <div class="form-row">
            <div class="form-field">
              <label for="firstName">Ime</label>
              <input id="firstName" name="firstName" [(ngModel)]="firstName" required />
            </div>
            <div class="form-field">
              <label for="lastName">Prezime</label>
              <input id="lastName" name="lastName" [(ngModel)]="lastName" required />
            </div>
          </div>
          <div class="form-field">
            <label for="email">Email</label>
            <input id="email" name="email" type="email" [(ngModel)]="email" required />
          </div>
          <div class="form-field">
            <label for="password">Lozinka</label>
            <input id="password" name="password" type="password" [(ngModel)]="password" required minlength="6" />
          </div>
          <div class="form-field">
            <label for="roleId">Registrujem se kao</label>
            @if (rolesLoading()) {
              <p class="muted">Učitavanje...</p>
            } @else {
              <select id="roleId" name="roleId" [(ngModel)]="roleId" required>
                @for (role of roles(); track role.id) {
                  <option [ngValue]="role.id">{{ label(role.name) }}</option>
                }
              </select>
            }
          </div>

          @if (error()) {
            <p class="error-text">{{ error() }}</p>
          }
          @if (success()) {
            <p class="success-text">Uspešna registracija! Možete se prijaviti.</p>
          }

          <button type="submit" [disabled]="form.invalid || loading() || !roleId" style="width: 100%;">
            {{ loading() ? 'Slanje...' : 'Registruj se' }}
          </button>
        </form>
        <p class="muted" style="margin-top: 1rem;">
          Već imate nalog? <a routerLink="/login">Prijavite se</a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent implements OnInit {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  roleId = 0;

  roles = signal<RoleListItemDto[]>([]);
  rolesLoading = signal(true);

  loading = signal(false);
  error = signal('');
  success = signal(false);

  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  ngOnInit(): void {
    this.auth.getRegistrableRoles().subscribe({
      next: (roles) => {
        this.roles.set(roles);
        this.rolesLoading.set(false);
        if (roles.length) {
          this.roleId = roles[0].id;
        }
      },
      error: () => {
        this.rolesLoading.set(false);
        this.error.set('Nije moguće učitati dostupne uloge. Pokušajte kasnije.');
      },
    });
  }

  label(name: string): string {
    return ROLE_LABELS[name] ?? name;
  }

  submit(): void {
    if (!this.roleId) {
      this.error.set('Izaberite ulogu.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.success.set(false);
    this.auth
      .register({
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        password: this.password,
        roleId: this.roleId,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.success.set(true);
          setTimeout(() => this.router.navigate(['/login']), 1200);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(this.extractErrorMessage(err));
        },
      });
  }

  private extractErrorMessage(err: unknown): string {
    const fallback = 'Registracija nije uspela. Proverite podatke i pokušajte ponovo.';
    const body = (err as { error?: unknown })?.error;
    if (Array.isArray(body) && body.length) {
      return body.map((e: { error?: string }) => e?.error).filter(Boolean).join(' ') || fallback;
    }
    if (body && typeof body === 'object' && 'message' in body) {
      return String((body as { message?: unknown }).message ?? fallback);
    }
    return fallback;
  }
}
