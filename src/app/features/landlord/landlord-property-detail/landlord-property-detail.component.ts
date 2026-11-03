import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PropertyService } from '../../../core/services/property.service';
import { PropertyRoomService } from '../../../core/services/property-room.service';
import { PriceService } from '../../../core/services/price.service';
import { LookupService } from '../../../core/services/lookup.service';
import { resolveImageUrl } from '../../../core/services/image-url.util';
import { AmenityDto, PropertyDto, PropertyRoomPriceDto } from '../../../core/models';
import { PaginatorComponent } from '../../../shared/paginator/paginator.component';

const PRICES_PAGE_SIZE = 10;

@Component({
  selector: 'app-landlord-property-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginatorComponent],
  template: `
    @if (property(); as p) {
      <div class="container">
        <a routerLink="/landlord/properties">&larr; Moje nekretnine</a>
        <h1>{{ p.name }}</h1>
        <p class="muted">{{ p.address }}, {{ p.city }}, {{ p.country }}</p>

        @if (generalError()) {
          <p class="error-text">{{ generalError() }}</p>
        }

        <div class="section">
          <h2>Amenities</h2>
          <div style="margin-bottom: 0.75rem;">
            @for (name of p.amenities; track name) {
              <span class="badge badge-confirmed" style="margin-right: 0.4rem;">
                {{ name }}
                <button class="btn-danger btn-sm" style="margin-left: 0.4rem; padding: 0.05rem 0.4rem;" (click)="detachAmenity(name)">×</button>
              </span>
            }
          </div>
          <div class="flex-between" style="max-width: 400px;">
            <select [(ngModel)]="selectedAmenityId" name="amenityId">
              @for (amenity of availableAmenities(); track amenity.id) {
                <option [ngValue]="amenity.id">{{ amenity.name }}</option>
              }
            </select>
            <button class="btn-sm" (click)="attachAmenity()">Dodaj</button>
          </div>
        </div>

        <div class="section">
          <div class="flex-between">
            <h2>Sobe</h2>
            <button class="btn-sm" (click)="showAddRoom.set(!showAddRoom())">
              {{ showAddRoom() ? 'Otkaži' : '+ Dodaj sobu' }}
            </button>
          </div>

          @if (showAddRoom()) {
            <div class="card section">
              <div class="form-row">
                <div class="form-field">
                  <label>Naziv sobe</label>
                  <input [(ngModel)]="newRoom.name" name="roomName" />
                </div>
                <div class="form-field">
                  <label>Kapacitet</label>
                  <input type="number" min="1" [(ngModel)]="newRoom.capacity" name="roomCapacity" />
                </div>
              </div>
              <div class="form-field">
                <label>Slika</label>
                <input type="file" accept="image/*" (change)="onRoomImageSelected($event)" />
              </div>
              @if (addRoomError()) {
                <p class="error-text">{{ addRoomError() }}</p>
              }
              <button (click)="addRoom()" [disabled]="addingRoom()">
                {{ addingRoom() ? 'Čuvanje...' : 'Sačuvaj sobu' }}
              </button>
            </div>
          }

          @for (room of p.rooms; track room.id) {
            <div class="card section">
              <div class="flex-between">
                <h3>{{ room.name }} &middot; {{ room.capacity }} osoba</h3>
                <button class="btn-danger btn-sm" (click)="deleteRoom(room.id)">Obriši sobu</button>
              </div>

              @if (room.images.length) {
                <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); margin: 0.5rem 0;">
                  @for (image of room.images; track image) {
                    <img class="thumb" style="height: 90px;" [src]="resolveImage(image)" alt="{{ room.name }}" />
                  }
                </div>
              }
              <div class="flex-between">
                <input type="file" accept="image/*" multiple (change)="onExtraImagesSelected($event, room.id)" style="max-width: 260px;" />
                <button class="btn-secondary btn-sm" (click)="uploadImages(room.id)">Dodaj slike</button>
              </div>

              <div class="flex-between" style="margin-top: 1.25rem;">
                <h4 style="margin: 0;">Cene</h4>
                <button class="btn-secondary btn-sm" (click)="togglePrices(room.id)">
                  {{ pricesExpanded[room.id] ? 'Sakrij cene' : 'Prikaži cene' }}
                </button>
              </div>

              @if (pricesExpanded[room.id]) {
                @if ((prices[room.id] ?? []).length === 0) {
                  <p class="muted">Cena još nije postavljena za nijedan datum.</p>
                } @else {
                  <table>
                    <thead>
                      <tr><th>Datum</th><th>Cena</th><th></th></tr>
                    </thead>
                    <tbody>
                      @for (price of prices[room.id]; track price.id) {
                        <tr>
                          @if (editingPriceId() === price.id) {
                            <td><input type="date" [(ngModel)]="priceEdits[price.id].date" [name]="'editDate-' + price.id" /></td>
                            <td><input type="number" min="0" step="0.01" [(ngModel)]="priceEdits[price.id].price" [name]="'editPrice-' + price.id" /></td>
                            <td>
                              <button class="btn-sm" (click)="saveEdit(room.id, price.id)">Sačuvaj</button>
                              <button class="btn-secondary btn-sm" (click)="cancelEdit()">Otkaži</button>
                            </td>
                          } @else {
                            <td>{{ price.date | date: 'dd.MM.yyyy.' }}</td>
                            <td>{{ price.price | number: '1.0-2' }} €</td>
                            <td>
                              <button class="btn-secondary btn-sm" (click)="startEdit(price)">Izmeni</button>
                              <button class="btn-danger btn-sm" (click)="deletePrice(room.id, price.id)">Obriši</button>
                            </td>
                          }
                        </tr>
                      }
                    </tbody>
                  </table>
                  <app-paginator
                    [page]="pricesPage[room.id] ?? 1"
                    [totalPages]="pricesTotalPages[room.id] ?? 1"
                    (pageChange)="loadPrices(room.id, $event)"
                  ></app-paginator>
                }
              }

              <div class="form-row" style="margin-top: 1rem;">
                <div class="form-field">
                  <label>Datum od</label>
                  <input type="date" [(ngModel)]="priceForm[room.id].startDate" [name]="'priceStart-' + room.id" />
                </div>
                <div class="form-field">
                  <label>Datum do (opciono)</label>
                  <input type="date" [(ngModel)]="priceForm[room.id].endDate" [name]="'priceEnd-' + room.id" />
                </div>
              </div>
              <div class="flex-between">
                <input type="number" min="0" step="0.01" [(ngModel)]="priceForm[room.id].price" [name]="'price-' + room.id" placeholder="Cena po noći (€)" style="max-width: 200px;" />
                <button class="btn-sm" (click)="setPrice(room.id)">Postavi cenu</button>
              </div>
              @if (priceMessage[room.id]; as msg) {
                <p [class]="msg.ok ? 'success-text' : 'error-text'">{{ msg.text }}</p>
              }
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class LandlordPropertyDetailComponent implements OnInit {
  property = signal<PropertyDto | null>(null);
  propertyId = 0;

  allAmenities = signal<AmenityDto[]>([]);
  selectedAmenityId = 0;

  showAddRoom = signal(false);
  addingRoom = signal(false);
  addRoomError = signal('');
  generalError = signal('');
  newRoom = { name: '', capacity: 1 };
  newRoomImage: File | null = null;
  extraImages: Record<number, File[]> = {};

  priceForm: Record<number, { startDate: string; endDate: string; price: number | null }> = {};
  priceMessage: Record<number, { ok: boolean; text: string }> = {};

  pricesExpanded: Record<number, boolean> = {};
  prices: Record<number, PropertyRoomPriceDto[]> = {};
  pricesPage: Record<number, number> = {};
  pricesTotalPages: Record<number, number> = {};
  priceEdits: Record<number, { date: string; price: number }> = {};
  editingPriceId = signal<number | null>(null);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly propertyService: PropertyService,
    private readonly roomService: PropertyRoomService,
    private readonly priceService: PriceService,
    private readonly lookupService: LookupService,
  ) {}

  ngOnInit(): void {
    this.propertyId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
    this.lookupService.getAmenities().subscribe((amenities) => this.allAmenities.set(amenities));
  }

  load(): void {
    this.propertyService.getById(this.propertyId).subscribe((p) => {
      this.property.set(p);
      p.rooms.forEach((room) => {
        this.priceForm[room.id] = { startDate: '', endDate: '', price: null };
      });
    });
  }

  togglePrices(roomId: number): void {
    const willExpand = !this.pricesExpanded[roomId];
    this.pricesExpanded[roomId] = willExpand;
    if (willExpand && !this.prices[roomId]) {
      this.loadPrices(roomId, 1);
    }
  }

  loadPrices(roomId: number, page: number): void {
    this.priceService.getForRoom(roomId, page, PRICES_PAGE_SIZE).subscribe((result) => {
      this.prices[roomId] = result.items;
      this.pricesPage[roomId] = result.page;
      this.pricesTotalPages[roomId] = result.totalPages || 1;
    });
  }

  availableAmenities() {
    const attached = new Set(this.property()?.amenities ?? []);
    return this.allAmenities().filter((a) => !attached.has(a.name));
  }

  attachAmenity(): void {
    if (!this.selectedAmenityId) return;
    this.generalError.set('');
    this.lookupService.attachAmenity({ propertyId: this.propertyId, amenityId: this.selectedAmenityId }).subscribe({
      next: () => this.load(),
      error: (err) => this.generalError.set(this.extractErrorMessage(err, 'Dodavanje sadržaja nije uspelo.')),
    });
  }

  detachAmenity(name: string): void {
    const amenity = this.allAmenities().find((a) => a.name === name);
    if (!amenity) return;
    this.generalError.set('');
    this.lookupService.detachAmenity(this.propertyId, amenity.id).subscribe({
      next: () => this.load(),
      error: (err) => this.generalError.set(this.extractErrorMessage(err, 'Uklanjanje sadržaja nije uspelo.')),
    });
  }

  onRoomImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.newRoomImage = input.files?.[0] ?? null;
  }

  addRoom(): void {
    this.addRoomError.set('');
    if (!this.newRoom.name.trim()) {
      this.addRoomError.set('Unesite naziv sobe.');
      return;
    }
    if (!this.newRoomImage) {
      this.addRoomError.set('Izaberite sliku.');
      return;
    }
    this.addingRoom.set(true);
    this.roomService
      .create({ name: this.newRoom.name, capacity: this.newRoom.capacity, propertyId: this.propertyId, image: this.newRoomImage })
      .subscribe({
        next: () => {
          this.addingRoom.set(false);
          this.showAddRoom.set(false);
          this.newRoom = { name: '', capacity: 1 };
          this.newRoomImage = null;
          this.load();
        },
        error: (err) => {
          this.addingRoom.set(false);
          this.addRoomError.set(this.extractErrorMessage(err, 'Dodavanje sobe nije uspelo.'));
        },
      });
  }

  deleteRoom(id: number): void {
    if (!confirm('Obrisati ovu sobu?')) return;
    this.generalError.set('');
    this.roomService.delete(id).subscribe({
      next: () => this.load(),
      error: (err) => this.generalError.set(this.extractErrorMessage(err, 'Brisanje sobe nije uspelo.')),
    });
  }

  onExtraImagesSelected(event: Event, roomId: number): void {
    const input = event.target as HTMLInputElement;
    this.extraImages[roomId] = input.files ? Array.from(input.files) : [];
  }

  uploadImages(roomId: number): void {
    const images = this.extraImages[roomId];
    if (!images?.length) {
      this.generalError.set('Izaberite bar jednu sliku.');
      return;
    }
    this.generalError.set('');
    this.roomService.attachImages(roomId, images).subscribe({
      next: () => this.load(),
      error: (err) => this.generalError.set(this.extractErrorMessage(err, 'Dodavanje slika nije uspelo.')),
    });
  }

  setPrice(roomId: number): void {
    const form = this.priceForm[roomId];
    if (!form.startDate || form.price === null) {
      this.priceMessage[roomId] = { ok: false, text: 'Unesite datum i cenu.' };
      return;
    }
    this.priceService
      .attach({ propertyRoomId: roomId, startDate: form.startDate, endDate: form.endDate || null, price: form.price })
      .subscribe({
        next: () => {
          this.priceMessage[roomId] = { ok: true, text: 'Cena je postavljena.' };
          this.priceForm[roomId] = { startDate: '', endDate: '', price: null };
          if (this.pricesExpanded[roomId]) {
            this.loadPrices(roomId, 1);
          }
        },
        error: (err) => {
          this.priceMessage[roomId] = { ok: false, text: this.extractErrorMessage(err, 'Postavljanje cene nije uspelo. Proverite unete podatke.') };
        },
      });
  }

  startEdit(price: PropertyRoomPriceDto): void {
    this.priceEdits[price.id] = { date: price.date.substring(0, 10), price: price.price };
    this.editingPriceId.set(price.id);
  }

  cancelEdit(): void {
    this.editingPriceId.set(null);
  }

  saveEdit(roomId: number, priceId: number): void {
    const edit = this.priceEdits[priceId];
    if (!edit) return;
    this.priceService.update({ id: priceId, date: edit.date, price: edit.price }).subscribe({
      next: () => {
        this.editingPriceId.set(null);
        this.priceMessage[roomId] = { ok: true, text: 'Cena je izmenjena.' };
        this.loadPrices(roomId, this.pricesPage[roomId] ?? 1);
      },
      error: (err) => {
        this.priceMessage[roomId] = { ok: false, text: this.extractErrorMessage(err, 'Izmena cene nije uspela.') };
      },
    });
  }

  deletePrice(roomId: number, priceId: number): void {
    if (!confirm('Obrisati ovu cenu?')) return;
    this.priceService.delete(priceId).subscribe({
      next: () => this.loadPrices(roomId, this.pricesPage[roomId] ?? 1),
      error: (err) => {
        this.priceMessage[roomId] = { ok: false, text: this.extractErrorMessage(err, 'Brisanje cene nije uspelo.') };
      },
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

  resolveImage(path: string): string {
    return resolveImageUrl(path);
  }
}
