import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PropertyService } from '../../../core/services/property.service';
import { PropertyRoomService } from '../../../core/services/property-room.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { ReviewService } from '../../../core/services/review.service';
import { resolveImageUrl } from '../../../core/services/image-url.util';
import {
  PropertyDto,
  PropertyRoomAvailabilityDto,
  PropertyRoomDto,
  ReviewDto,
} from '../../../core/models';
import { PaginatorComponent } from '../../../shared/paginator/paginator.component';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginatorComponent],
  template: `
    @if (property(); as p) {
      <div class="container">
        <a routerLink="/">&larr; Nazad na pretragu</a>

        <div class="hero-image">
          @if (p.images.length) {
            <img [src]="resolveImage(p.images[0])" alt="{{ p.name }}" />
          }
        </div>

        <div class="section" style="margin-top: 1.5rem;">
          <div class="flex-between" style="align-items: flex-start;">
            <div>
              <h1 style="font-size: 1.9rem;">{{ p.name }}</h1>
              <p class="muted">📍 {{ p.address }}, {{ p.city }}, {{ p.country }}</p>
            </div>
            @if (p.rating) {
              <div style="text-align: right;">
                <div style="font-size: 1.3rem; font-weight: 800; color: var(--color-primary);">
                  ⭐ {{ p.rating | number: '1.1-1' }}
                </div>
                <div class="price-tag-label">ocena gostiju</div>
              </div>
            }
          </div>

          @if (p.images.length > 1) {
            <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); margin-top: 1.25rem;">
              @for (image of p.images.slice(1); track image) {
                <img class="thumb" style="height: 100px;" [src]="resolveImage(image)" alt="{{ p.name }}" />
              }
            </div>
          }

          <!-- Key info grid -->
          <div class="info-grid">
            <div>
              <div class="info-label">Tip smeštaja</div>
              <div class="info-value">{{ p.propertyType }}</div>
            </div>
            <div>
              <div class="info-label">Broj soba</div>
              <div class="info-value">{{ p.rooms.length }}</div>
            </div>
            <div>
              <div class="info-label">Max. gostiju</div>
              <div class="info-value">{{ maxCapacity() }}</div>
            </div>
            <div>
              <div class="info-label">Sadržaji</div>
              <div class="info-value">{{ p.amenities.length }}</div>
            </div>
          </div>

          <div class="section">
            <h3>O smeštaju</h3>
            <p class="muted" style="font-size: 0.95rem; line-height: 1.7;">{{ p.description }}</p>
          </div>

          @if (p.amenities.length) {
            <div class="section">
              <h3>🛎️ Pogodnosti</h3>
              <div class="amenities-grid">
                @for (amenity of p.amenities; track amenity) {
                  <div class="amenity-item">✓ {{ amenity }}</div>
                }
              </div>
            </div>
          }
        </div>

        <div class="section">
          <h2>Sobe i rezervacija</h2>
          <div class="grid" style="gap: 1.25rem;">
            @for (room of p.rooms; track room.id) {
              <div class="card">
                <div class="flex-between">
                  <div>
                    <h3 style="font-size: 1.1rem;">{{ room.name }}</h3>
                    <p class="muted">👥 Kapacitet: {{ room.capacity }} osoba</p>
                  </div>
                  @if (room.images.length) {
                    <img class="thumb" style="width: 140px; height: 100px;" [src]="resolveImage(room.images[0])" alt="{{ room.name }}" />
                  }
                </div>

                <div class="form-row" style="margin-top: 0.9rem;">
                  <div class="form-field">
                    <label>Datum dolaska</label>
                    <input type="date" [(ngModel)]="bookingDates[room.id].start" [name]="'start-' + room.id" />
                  </div>
                  <div class="form-field">
                    <label>Datum odlaska</label>
                    <input type="date" [(ngModel)]="bookingDates[room.id].end" [name]="'end-' + room.id" />
                  </div>
                </div>

                <div class="flex-between">
                  <button class="btn-secondary btn-sm" (click)="checkAvailability(room)">PROVERI DOSTUPNOST</button>
                  @if (auth.isLoggedIn()) {
                    <button class="btn-sm" (click)="book(room)" [disabled]="booking() === room.id">
                      {{ booking() === room.id ? 'REZERVIŠEM...' : 'REZERVIŠI' }}
                    </button>
                  } @else {
                    <a routerLink="/login" class="btn-sm btn-secondary">PRIJAVITE SE ZA REZERVACIJU</a>
                  }
                </div>

                @if (availability[room.id]; as avail) {
                  <p class="muted" style="margin-top: 0.6rem;">
                    {{ avail.isAvailable ? '✅ Dostupno za izabrani period' : '❌ Nije dostupno za izabrani period' }}
                    @if (avail.isAvailable && !avail.priceIsSet) {
                      &middot; (cena nije definisana za ceo period)
                    }
                  </p>
                }
                @if (bookingMessage[room.id]; as msg) {
                  <p [class]="msg.ok ? 'success-text' : 'error-text'">{{ msg.text }}</p>
                }
              </div>
            }
          </div>
        </div>

        <div class="section">
          <div class="flex-between">
            <h2>⭐ Recenzije</h2>
            @if (auth.hasRole('Tenant')) {
              <button class="btn-sm btn-secondary" (click)="showReviewForm.set(!showReviewForm())">
                {{ showReviewForm() ? 'OTKAŽI' : 'NAPIŠI RECENZIJU' }}
              </button>
            }
          </div>

          @if (showReviewForm()) {
            <div class="card" style="margin-bottom: 1rem;">
              <div class="form-field">
                <label>Ocena (1-5)</label>
                <input type="number" min="1" max="5" [(ngModel)]="newReview.rating" name="rating" />
              </div>
              <div class="form-field">
                <label>Komentar</label>
                <textarea rows="3" [(ngModel)]="newReview.comment" name="comment"></textarea>
              </div>
              @if (reviewError()) {
                <p class="error-text">{{ reviewError() }}</p>
              }
              <button (click)="submitReview()" [disabled]="submittingReview()">
                {{ submittingReview() ? 'ŠALJEM...' : 'POŠALJI RECENZIJU' }}
              </button>
            </div>
          }

          @if (reviewsLoadError()) {
            <p class="error-text">{{ reviewsLoadError() }}</p>
          } @else if (reviews().length === 0) {
            <div class="empty-state">Još nema recenzija za ovaj smeštaj.</div>
          } @else {
            @for (review of reviews(); track review.id) {
              <div class="review-card">
                <div class="flex-between" style="align-items: flex-start;">
                  <strong>{{ review.userFullName }}</strong>
                  <span style="color: var(--color-primary); font-weight: 700;">⭐ {{ review.rating }}/5</span>
                </div>
                <p style="margin: 0.5rem 0; font-size: 0.9rem; color: var(--color-muted);">{{ review.comment }}</p>
                <p class="muted" style="font-size: 0.78rem;">{{ review.createdAt | date: 'dd.MM.yyyy.' }}</p>
                @if (auth.currentUser()?.id === review.userId) {
                  <button class="btn-danger btn-sm" (click)="deleteReview(review.id)">OBRIŠI</button>
                }
                @if (reviewActionError[review.id]) {
                  <p class="error-text">{{ reviewActionError[review.id] }}</p>
                }
              </div>
            }
            <app-paginator [page]="reviewPage()" [totalPages]="reviewTotalPages()" (pageChange)="loadReviews($event)"></app-paginator>
          }
        </div>
      </div>
    } @else if (notFound()) {
      <div class="container empty-state">Smeštaj nije pronađen.</div>
    }
  `,
  styles: [`
    .hero-image {
      width: 100%;
      height: 340px;
      background: linear-gradient(135deg, #e8ecd8 0%, #d4dfc2 100%);
      margin-top: 1rem;
      overflow: hidden;
    }
    .hero-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin: 1.75rem 0;
      padding: 1.25rem;
      background: #f9fafb;
    }
    .info-label {
      font-size: 0.7rem;
      color: var(--color-muted-2);
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.3px;
      margin-bottom: 0.3rem;
    }
    .info-value {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--color-primary);
    }
    .amenities-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 0.6rem;
    }
    .amenity-item {
      font-size: 0.85rem;
      font-weight: 600;
      padding: 0.65rem 0.8rem;
      background: var(--color-primary-light);
      color: var(--color-primary-dark);
    }
    .review-card {
      background: #f9fafb;
      padding: 1rem;
      margin-bottom: 0.75rem;
    }
    @media (max-width: 640px) {
      .info-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `],
})
export class PropertyDetailComponent implements OnInit {
  property = signal<PropertyDto | null>(null);
  notFound = signal(false);
  propertyId = 0;

  maxCapacity = computed(() => {
    const p = this.property();
    if (!p || !p.rooms.length) return 0;
    return Math.max(...p.rooms.map((r) => r.capacity));
  });

  availability: Record<number, PropertyRoomAvailabilityDto> = {};
  bookingDates: Record<number, { start: string; end: string }> = {};
  bookingMessage: Record<number, { ok: boolean; text: string }> = {};
  booking = signal<number | null>(null);

  reviews = signal<ReviewDto[]>([]);
  reviewPage = signal(1);
  reviewTotalPages = signal(1);
  showReviewForm = signal(false);
  newReview = { rating: 5, comment: '' };
  reviewError = signal('');
  submittingReview = signal(false);
  reviewActionError: Record<number, string> = {};
  reviewsLoadError = signal('');

  constructor(
    private readonly route: ActivatedRoute,
    private readonly propertyService: PropertyService,
    private readonly roomService: PropertyRoomService,
    private readonly reservationService: ReservationService,
    private readonly reviewService: ReviewService,
    readonly auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.propertyId = Number(this.route.snapshot.paramMap.get('id'));
    this.propertyService.getById(this.propertyId).subscribe({
      next: (p) => {
        this.property.set(p);
        p.rooms.forEach((room) => (this.bookingDates[room.id] = { start: '', end: '' }));
      },
      error: () => this.notFound.set(true),
    });
    this.loadReviews(1);
  }

  loadReviews(page: number): void {
    this.reviewsLoadError.set('');
    this.reviewService.getForProperty(this.propertyId, page, 10).subscribe({
      next: (result) => {
        this.reviews.set(result.items);
        this.reviewPage.set(result.page);
        this.reviewTotalPages.set(result.totalPages || 1);
      },
      error: (err) => {
        this.reviewsLoadError.set(this.extractErrorMessage(err, 'Učitavanje recenzija nije uspelo.'));
      },
    });
  }

  checkAvailability(room: PropertyRoomDto): void {
    const dates = this.bookingDates[room.id];
    if (!dates.start || !dates.end) {
      return;
    }
    this.roomService.checkAvailability(room.id, dates.start, dates.end).subscribe((result) => {
      this.availability[room.id] = result;
    });
  }

  book(room: PropertyRoomDto): void {
    const dates = this.bookingDates[room.id];
    if (!dates.start || !dates.end) {
      this.bookingMessage[room.id] = { ok: false, text: 'Izaberite datum dolaska i odlaska.' };
      return;
    }
    this.booking.set(room.id);
    this.reservationService
      .create({ propertyRoomId: room.id, startDate: dates.start, endDate: dates.end })
      .subscribe({
        next: () => {
          this.booking.set(null);
          this.bookingMessage[room.id] = { ok: true, text: 'Rezervacija je uspešno kreirana.' };
        },
        error: (err) => {
          this.booking.set(null);
          this.bookingMessage[room.id] = {
            ok: false,
            text: this.extractErrorMessage(err, 'Rezervacija nije uspela. Proverite dostupnost.'),
          };
        },
      });
  }

  submitReview(): void {
    this.reviewError.set('');
    if (!this.newReview.comment.trim()) {
      this.reviewError.set('Unesite komentar.');
      return;
    }
    if (!this.newReview.rating || this.newReview.rating < 1 || this.newReview.rating > 5) {
      this.reviewError.set('Ocena mora biti između 1 i 5.');
      return;
    }
    this.submittingReview.set(true);
    this.reviewService
      .add({ propertyId: this.propertyId, rating: this.newReview.rating, comment: this.newReview.comment })
      .subscribe({
        next: () => {
          this.submittingReview.set(false);
          this.showReviewForm.set(false);
          this.newReview = { rating: 5, comment: '' };
          this.loadReviews(1);
        },
        error: (err) => {
          this.submittingReview.set(false);
          this.reviewError.set(this.extractErrorMessage(err, 'Slanje recenzije nije uspelo.'));
        },
      });
  }

  deleteReview(id: number): void {
    delete this.reviewActionError[id];
    this.reviewService.delete(id).subscribe({
      next: () => this.loadReviews(this.reviewPage()),
      error: (err) => {
        this.reviewActionError[id] = this.extractErrorMessage(err, 'Brisanje recenzije nije uspelo.');
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
