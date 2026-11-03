import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LookupService } from '../../../core/services/lookup.service';
import {
  AmenityDto,
  CountryDto,
  DestinationDto,
  RoleListItemDto,
  UseCaseListItemDto,
} from '../../../core/models';

type Tab = 'countries' | 'destinations' | 'amenities' | 'roles' | 'usecases';

@Component({
  selector: 'app-admin-lookups',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h1>Šifarnici</h1>

      <div class="tabs">
        <div class="tab" [class.active]="tab() === 'countries'" (click)="tab.set('countries')">Države</div>
        <div class="tab" [class.active]="tab() === 'destinations'" (click)="tab.set('destinations')">Destinacije</div>
        <div class="tab" [class.active]="tab() === 'amenities'" (click)="tab.set('amenities')">Sadržaji</div>
        <div class="tab" [class.active]="tab() === 'roles'" (click)="tab.set('roles')">Uloge</div>
        <div class="tab" [class.active]="tab() === 'usecases'" (click)="tab.set('usecases')">Dozvole</div>
      </div>

      @if (tab() === 'countries') {
        <div class="card section" style="max-width: 420px;">
          <div class="flex-between">
            <input [(ngModel)]="newCountryName" name="newCountryName" placeholder="Naziv države" />
            <button class="btn-sm" (click)="addCountry()">Dodaj</button>
          </div>
          @if (countryError()) {
            <p class="error-text">{{ countryError() }}</p>
          }
        </div>
        <table>
          <thead><tr><th>Naziv</th></tr></thead>
          <tbody>
            @for (c of countries(); track c.id) { <tr><td>{{ c.name }}</td></tr> }
          </tbody>
        </table>
      }

      @if (tab() === 'destinations') {
        <div class="card section" style="max-width: 460px;">
          <div class="form-row">
            <input [(ngModel)]="newDestinationName" name="newDestinationName" placeholder="Naziv grada" />
            <select [(ngModel)]="newDestinationCountryId" name="newDestinationCountryId">
              @for (c of countries(); track c.id) { <option [ngValue]="c.id">{{ c.name }}</option> }
            </select>
          </div>
          <button class="btn-sm" (click)="addDestination()">Dodaj destinaciju</button>
          @if (destinationError()) {
            <p class="error-text">{{ destinationError() }}</p>
          }
        </div>
        <table>
          <thead><tr><th>Grad</th><th>Država</th></tr></thead>
          <tbody>
            @for (d of destinations(); track d.id) { <tr><td>{{ d.city }}</td><td>{{ d.countryName }}</td></tr> }
          </tbody>
        </table>
      }

      @if (tab() === 'amenities') {
        <div class="card section" style="max-width: 420px;">
          <div class="flex-between">
            <input [(ngModel)]="newAmenityName" name="newAmenityName" placeholder="Naziv sadržaja (npr. Wi-Fi)" />
            <button class="btn-sm" (click)="addAmenity()">Dodaj</button>
          </div>
          @if (amenityError()) {
            <p class="error-text">{{ amenityError() }}</p>
          }
        </div>
        <table>
          <thead><tr><th>Naziv</th></tr></thead>
          <tbody>
            @for (a of amenities(); track a.id) { <tr><td>{{ a.name }}</td></tr> }
          </tbody>
        </table>
      }

      @if (tab() === 'roles') {
        <div class="card section" style="max-width: 420px;">
          <div class="flex-between">
            <input [(ngModel)]="newRoleName" name="newRoleName" placeholder="Naziv uloge" />
            <button class="btn-sm" (click)="addRole()">Dodaj</button>
          </div>
          @if (roleError()) {
            <p class="error-text">{{ roleError() }}</p>
          }
        </div>
        <table>
          <thead><tr><th>Id</th><th>Naziv</th></tr></thead>
          <tbody>
            @for (r of roles(); track r.id) { <tr><td>{{ r.id }}</td><td>{{ r.name }}</td></tr> }
          </tbody>
        </table>
      }

      @if (tab() === 'usecases') {
        <p class="muted">Dozvole (use case-ovi) se dodeljuju ulogama za fino podešavanje pristupa API-ju.</p>
        <div class="card section" style="max-width: 500px;">
          <h3>Nova dozvola</h3>
          <div class="form-row">
            <input [(ngModel)]="newUseCase.name" name="newUseCaseName" placeholder="Naziv" />
            <input [(ngModel)]="newUseCase.useCaseId" name="newUseCaseId" placeholder="Kod (useCaseId)" />
          </div>
          <button class="btn-sm" (click)="addUseCase()">Dodaj</button>
          @if (useCaseError()) {
            <p class="error-text">{{ useCaseError() }}</p>
          }
        </div>

        <div class="card section" style="max-width: 500px;">
          <h3>Dodeli ulozi</h3>
          <div class="form-row">
            <select [(ngModel)]="attachRoleId" name="attachRoleId">
              @for (r of roles(); track r.id) { <option [ngValue]="r.id">{{ r.name }}</option> }
            </select>
            <select [(ngModel)]="attachUseCaseId" name="attachUseCaseId">
              @for (u of useCases(); track u.id) { <option [ngValue]="u.id">{{ u.name }}</option> }
            </select>
          </div>
          <div class="flex-between">
            <button class="btn-sm" (click)="attachUseCase()">Dodeli</button>
            <button class="btn-secondary btn-sm" (click)="detachUseCase()">Ukini</button>
          </div>
          @if (attachError()) {
            <p class="error-text">{{ attachError() }}</p>
          }
        </div>

        <table>
          <thead><tr><th>Kod</th><th>Naziv</th></tr></thead>
          <tbody>
            @for (u of useCases(); track u.id) { <tr><td>{{ u.useCaseId }}</td><td>{{ u.name }}</td></tr> }
          </tbody>
        </table>
      }
    </div>
  `,
})
export class AdminLookupsComponent implements OnInit {
  tab = signal<Tab>('countries');

  countries = signal<CountryDto[]>([]);
  destinations = signal<DestinationDto[]>([]);
  amenities = signal<AmenityDto[]>([]);
  roles = signal<RoleListItemDto[]>([]);
  useCases = signal<UseCaseListItemDto[]>([]);

  newCountryName = '';
  newDestinationName = '';
  newDestinationCountryId = 0;
  newAmenityName = '';
  newRoleName = '';
  newUseCase = { name: '', useCaseId: '' };
  attachRoleId = 0;
  attachUseCaseId = 0;

  countryError = signal('');
  destinationError = signal('');
  amenityError = signal('');
  roleError = signal('');
  useCaseError = signal('');
  attachError = signal('');

  constructor(private readonly lookupService: LookupService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.lookupService.getCountries().subscribe((c) => {
      this.countries.set(c);
      if (c.length) this.newDestinationCountryId = c[0].id;
    });
    this.lookupService.getDestinations().subscribe((d) => this.destinations.set(d));
    this.lookupService.getAmenities().subscribe((a) => this.amenities.set(a));
    this.lookupService.getRoles().subscribe((r) => {
      this.roles.set(r);
      if (r.length) this.attachRoleId = r[0].id;
    });
    this.lookupService.getUseCases().subscribe((u) => {
      this.useCases.set(u);
      if (u.length) this.attachUseCaseId = u[0].id;
    });
  }

  addCountry(): void {
    this.countryError.set('');
    if (!this.newCountryName.trim()) {
      this.countryError.set('Unesite naziv države.');
      return;
    }
    this.lookupService.addCountry({ name: this.newCountryName }).subscribe({
      next: () => {
        this.newCountryName = '';
        this.loadAll();
      },
      error: (err) => this.countryError.set(this.extractErrorMessage(err, 'Dodavanje države nije uspelo.')),
    });
  }

  addDestination(): void {
    this.destinationError.set('');
    if (!this.newDestinationName.trim() || !this.newDestinationCountryId) {
      this.destinationError.set('Unesite naziv grada i izaberite državu.');
      return;
    }
    this.lookupService
      .addDestination({ name: this.newDestinationName, countryId: this.newDestinationCountryId })
      .subscribe({
        next: () => {
          this.newDestinationName = '';
          this.loadAll();
        },
        error: (err) => this.destinationError.set(this.extractErrorMessage(err, 'Dodavanje destinacije nije uspelo.')),
      });
  }

  addAmenity(): void {
    this.amenityError.set('');
    if (!this.newAmenityName.trim()) {
      this.amenityError.set('Unesite naziv sadržaja.');
      return;
    }
    this.lookupService.addAmenity({ name: this.newAmenityName }).subscribe({
      next: () => {
        this.newAmenityName = '';
        this.loadAll();
      },
      error: (err) => this.amenityError.set(this.extractErrorMessage(err, 'Dodavanje sadržaja nije uspelo.')),
    });
  }

  addRole(): void {
    this.roleError.set('');
    if (!this.newRoleName.trim()) {
      this.roleError.set('Unesite naziv uloge.');
      return;
    }
    this.lookupService.addRole({ name: this.newRoleName }).subscribe({
      next: () => {
        this.newRoleName = '';
        this.loadAll();
      },
      error: (err) => this.roleError.set(this.extractErrorMessage(err, 'Dodavanje uloge nije uspelo.')),
    });
  }

  addUseCase(): void {
    this.useCaseError.set('');
    if (!this.newUseCase.name.trim() || !this.newUseCase.useCaseId.trim()) {
      this.useCaseError.set('Unesite naziv i kod dozvole.');
      return;
    }
    this.lookupService.addUseCase(this.newUseCase).subscribe({
      next: () => {
        this.newUseCase = { name: '', useCaseId: '' };
        this.loadAll();
      },
      error: (err) => this.useCaseError.set(this.extractErrorMessage(err, 'Dodavanje dozvole nije uspelo.')),
    });
  }

  attachUseCase(): void {
    this.attachError.set('');
    if (!this.attachRoleId || !this.attachUseCaseId) return;
    this.lookupService.attachUseCase({ roleId: this.attachRoleId, useCaseId: this.attachUseCaseId }).subscribe({
      error: (err) => this.attachError.set(this.extractErrorMessage(err, 'Dodela dozvole nije uspela.')),
    });
  }

  detachUseCase(): void {
    this.attachError.set('');
    if (!this.attachRoleId || !this.attachUseCaseId) return;
    this.lookupService.detachUseCase(this.attachRoleId, this.attachUseCaseId).subscribe({
      error: (err) => this.attachError.set(this.extractErrorMessage(err, 'Ukidanje dozvole nije uspelo.')),
    });
  }

  private extractErrorMessage(err: unknown, fallback: string): string {
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
