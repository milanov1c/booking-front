import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="container" style="max-width: 420px;">
      <div class="card">
        <h2>Prijava</h2>
        <form (ngSubmit)="submit()" #form="ngForm">
          <div class="form-field">
            <label for="email">Email</label>
            <input id="email" name="email" type="email" [(ngModel)]="email" required />
          </div>
          <div class="form-field">
            <label for="password">Lozinka</label>
            <input id="password" name="password" type="password" [(ngModel)]="password" required />
          </div>

          @if (error()) {
            <p class="error-text">{{ error() }}</p>
          }

          <button type="submit" [disabled]="form.invalid || loading()" style="width: 100%;">
            {{ loading() ? 'Prijava...' : 'Prijavi se' }}
          </button>
        </form>
        <p class="muted" style="margin-top: 1rem;">
          Nemate nalog? <a routerLink="/register">Registrujte se</a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  submit(): void {
    this.loading.set(true);
    this.error.set('');
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Pogrešan email ili lozinka.');
      },
    });
  }
}
