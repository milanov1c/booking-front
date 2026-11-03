import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { PropertyService } from '../../../core/services/property.service';
import { LookupService } from '../../../core/services/lookup.service';
import { resolveImageUrl } from '../../../core/services/image-url.util';
import { DestinationDto, PropertyListItemDto, PropertyTypeDto } from '../../../core/models';
import { PaginatorComponent } from '../../../shared/paginator/paginator.component';

const PAGE_SIZE = 6;

@Component({
  selector: 'app-landlord-properties',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginatorComponent],
  template: `
    <div class="container">
      <div class="flex-between">
        <h1>Moje nekretnine</h1>
        <button (click)="showAddForm.set(!showAddForm())">
          {{ showAddForm() ? 'Otkaži' : '+ Dodaj nekretninu' }}
        </button>
      </div>

      @if (showAddForm()) {
        <div class="card section">
          <h2>Nova nekretnina</h2>
          <div class="form-field">
            <label>Naziv</label>
            <input [(ngModel)]="newProperty.name" name="name" />
          </div>
          <div class="form-field">
            <label>Opis</label>
            <textarea rows="3" [(ngModel)]="newProperty.description" name="description"></textarea>
          </div>
          <div class="form-field">
            <label>Adresa</label>
            <input [(ngModel)]="newProperty.address" name="address" />
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>Tip smeštaja</label>
              <select [(ngModel)]="newProperty.propertyTypeId" name="propertyTypeId">
                @for (type of propertyTypes(); track type.id) {
                  <option [ngValue]="type.id">{{ type.name }}</option>
                }
              </select>
            </div>
            <div class="form-field">
              <label>Destinacija</label>
              <select [(ngModel)]="newProperty.destinationId" name="destinationId">
                @for (destination of destinations(); track destination.id) {
                  <option [ngValue]="destination.id">{{ destination.city }}, {{ destination.countryName }}</option>
                }
              </select>
            </div>
          </div>
          <div class="form-field">
            <label>Slika</label>
            <input type="file" accept="image/*" (change)="onFileSelected($event)" />
          </div>

          @if (addError()) {
            <p class="error-text">{{ addError() }}</p>
          }

          <button (click)="createProperty()" [disabled]="creating()">
            {{ creating() ? 'Kreiranje...' : 'Sačuvaj' }}
          </button>
        </div>
      }

      @if (properties().length === 0) {
        <div class="empty-state">Još nemate dodatih nekretnina.</div>
      } @else {
        <div class="grid-cards">
          @for (property of pagedProperties(); track property.id) {
            <div class="card">
              <h3>{{ property.name }}</h3>
              <p class="muted">{{ property.city }}, {{ property.country }}</p>
              <p class="muted">{{ property.propertyRoomsNumber }} soba</p>

              <div class="flex-between" style="margin-top: 0.75rem;">
                <a [routerLink]="['/landlord/properties', property.id]" class="btn-sm">Upravljaj sobama</a>
                <button class="btn-danger btn-sm" (click)="deleteProperty(property.id)">Obriši</button>
              </div>

              <div class="flex-between" style="margin-top: 0.5rem;">
                <button class="btn-secondary btn-sm" (click)="toggleImages(property.id)">
                  {{ imagesExpanded[property.id] ? 'Sakrij slike' : 'Slike' }}
                </button>
              </div>

              @if (imagesExpanded[property.id]) {
                @if ((images[property.id] ?? []).length) {
                  <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); margin: 0.5rem 0;">
                    @for (image of images[property.id]; track image) {
                      <img class="thumb" style="height: 70px;" [src]="resolveImage(image)" alt="{{ property.name }}" />
                    }
                  </div>
                } @else {
                  <p class="muted" style="margin: 0.5rem 0;">Nema slika za ovu nekretninu.</p>
                }

                <input type="file" accept="image/*" multiple (change)="onExtraImagesSelected($event, property.id)" />
                <div class="flex-between" style="margin-top: 0.4rem;">
                  <button class="btn-sm" (click)="uploadImages(property.id)">Dodaj slike</button>
                </div>
                @if (imageMessage[property.id]; as msg) {
                  <p [class]="msg.ok ? 'success-text' : 'error-text'">{{ msg.text }}</p>
                }
              }
            </div>
          }
        </div>
        <app-paginator [page]="page()" [totalPages]="totalPages()" (pageChange)="goToPage($event)"></app-paginator>
      }
    </div>
  `,
})
export class LandlordPropertiesComponent implements OnInit {
  properties = signal<PropertyListItemDto[]>([]);
  propertyTypes = signal<PropertyTypeDto[]>([]);
  destinations = signal<DestinationDto[]>([]);
  showAddForm = signal(false);
  creating = signal(false);
  addError = signal('');

  page = signal(1);
  totalPages = computed(() => Math.max(1, Math.ceil(this.properties().length / PAGE_SIZE)));
  pagedProperties = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.properties().slice(start, start + PAGE_SIZE);
  });

  newProperty = {
    name: '',
    description: '',
    address: '',
    propertyTypeId: 0,
    destinationId: 0,
  };
  selectedImage: File | null = null;

  imagesExpanded: Record<number, boolean> = {};
  images: Record<number, string[]> = {};
  extraImages: Record<number, File[]> = {};
  imageMessage: Record<number, { ok: boolean; text: string }> = {};

  constructor(
    private readonly userService: UserService,
    private readonly propertyService: PropertyService,
    private readonly lookupService: LookupService,
    private readonly auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadProperties();
    this.propertyService.getPropertyTypes().subscribe((types) => {
      this.propertyTypes.set(types);
      if (types.length) this.newProperty.propertyTypeId = types[0].id;
    });
    this.lookupService.getDestinations().subscribe((destinations) => {
      this.destinations.set(destinations);
      if (destinations.length) this.newProperty.destinationId = destinations[0].id;
    });
  }

  loadProperties(): void {
    this.userService.getProfile().subscribe((profile) => {
      this.properties.set(profile.ownedProperties ?? []);
      this.page.set(1);
    });
  }

  goToPage(page: number): void {
    this.page.set(page);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedImage = input.files?.[0] ?? null;
  }

  createProperty(): void {
    if (!this.selectedImage) {
      this.addError.set('Izaberite sliku.');
      return;
    }
    this.creating.set(true);
    this.addError.set('');
    // A Landlord's ownership is always forced server-side, but an Admin has
    // no ownership of their own by default - send their own id so a property
    // they create through this (shared) landlord UI is actually usable
    // afterward instead of failing with a foreign-key error.
    const landlordId = this.auth.hasRole('Admin') ? this.auth.currentUser()?.id : undefined;
    this.propertyService
      .create({ ...this.newProperty, image: this.selectedImage, landlordId })
      .subscribe({
        next: () => {
          this.creating.set(false);
          this.showAddForm.set(false);
          this.newProperty = { name: '', description: '', address: '', propertyTypeId: 0, destinationId: 0 };
          this.selectedImage = null;
          this.loadProperties();
        },
        error: () => {
          this.creating.set(false);
          this.addError.set('Kreiranje nekretnine nije uspelo.');
        },
      });
  }

  deleteProperty(id: number): void {
    if (!confirm('Da li ste sigurni da želite da obrišete ovu nekretninu?')) {
      return;
    }
    this.propertyService.delete(id).subscribe(() => this.loadProperties());
  }

  toggleImages(propertyId: number): void {
    const willExpand = !this.imagesExpanded[propertyId];
    this.imagesExpanded[propertyId] = willExpand;
    if (willExpand) {
      this.loadImages(propertyId);
    }
  }

  loadImages(propertyId: number): void {
    this.propertyService.getById(propertyId).subscribe((p) => {
      this.images[propertyId] = p.images;
    });
  }

  onExtraImagesSelected(event: Event, propertyId: number): void {
    const input = event.target as HTMLInputElement;
    this.extraImages[propertyId] = input.files ? Array.from(input.files) : [];
  }

  uploadImages(propertyId: number): void {
    const files = this.extraImages[propertyId];
    if (!files?.length) {
      this.imageMessage[propertyId] = { ok: false, text: 'Izaberite bar jednu sliku.' };
      return;
    }
    this.propertyService.attachImages(propertyId, files).subscribe({
      next: () => {
        this.imageMessage[propertyId] = { ok: true, text: 'Slike su dodate.' };
        this.extraImages[propertyId] = [];
        this.loadImages(propertyId);
      },
      error: (err) => {
        this.imageMessage[propertyId] = { ok: false, text: this.extractErrorMessage(err) };
      },
    });
  }

  private extractErrorMessage(err: unknown): string {
    const fallback = 'Dodavanje slika nije uspelo.';
    const body = (err as { error?: unknown })?.error;
    if (Array.isArray(body) && body.length) {
      return body.map((e: { error?: string }) => e?.error).filter(Boolean).join(' ') || fallback;
    }
    if (body && typeof body === 'object' && 'message' in body) {
      return String((body as { message?: unknown }).message ?? fallback);
    }
    return fallback;
  }

  resolveImage(path: string): string {
    return resolveImageUrl(path);
  }
}
