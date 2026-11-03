import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PropertyService } from '../../../core/services/property.service';
import { LookupService } from '../../../core/services/lookup.service';
import { resolveImageUrl } from '../../../core/services/image-url.util';
import { PropertyListItemDto, PropertySearchDto } from '../../../core/models';
import { PaginatorComponent } from '../../../shared/paginator/paginator.component';

const PRICE_RANGES: { label: string; min?: number; max?: number }[] = [
  { label: 'Sve cene' },
  { label: 'Do 50 €', max: 50 },
  { label: '50 – 100 €', min: 50, max: 100 },
  { label: '100 – 200 €', min: 100, max: 200 },
  { label: '200 €+', min: 200 },
];

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginatorComponent],
  template: `
    <!-- Hero -->
    <section class="hero">
      <div class="hero-inner">
        <h1 class="hero-title">PRONAĐI SAVRŠEN SMEŠTAJ</h1>
        <p class="hero-subtitle">
          Pretraži smeštaje po gradu, državi, ceni i kapacitetu i rezerviši direktno kod vlasnika.
        </p>
        <div class="hero-stats">
          <div class="hero-stat">🏠 {{ totalCount() }} SMEŠTAJA</div>
          @if (avgRating(); as avg) {
            <div class="hero-stat">⭐ {{ avg | number: '1.1-1' }} PROSEČNA OCENA</div>
          }
          <div class="hero-stat">🔒 SIGURNA REZERVACIJA</div>
        </div>
      </div>
    </section>

    <!-- Filter bar -->
    <header class="filter-bar">
      <div class="container">
        <h2 class="filter-title">Filtriraj smeštaje</h2>
        <form (ngSubmit)="search(1)" class="filter-row">
          <input name="name" [(ngModel)]="query.name" (ngModelChange)="onFilterChange()" placeholder="Pretraži po nazivu..." class="filter-input" />
          <select name="city" [(ngModel)]="query.city" (ngModelChange)="search(1)" class="filter-input" style="max-width: 160px;">
            <option [ngValue]="undefined">Svi gradovi</option>
            @for (city of cities(); track city) {
              <option [ngValue]="city">{{ city }}</option>
            }
          </select>
          <select name="country" [(ngModel)]="query.country" (ngModelChange)="search(1)" class="filter-input" style="max-width: 160px;">
            <option [ngValue]="undefined">Sve države</option>
            @for (country of countries(); track country) {
              <option [ngValue]="country">{{ country }}</option>
            }
          </select>
          <input
            name="minCapacity"
            type="number"
            min="1"
            [(ngModel)]="query.minCapacity"
            (ngModelChange)="onFilterChange()"
            placeholder="Broj gostiju"
            class="filter-input"
            style="max-width: 140px;"
          />
          <select [(ngModel)]="selectedPriceRange" name="priceRange" class="filter-input" style="max-width: 160px;" (ngModelChange)="onPriceRangeChange()">
            @for (range of priceRanges; track range.label) {
              <option [ngValue]="range">{{ range.label }}</option>
            }
          </select>
          <button type="button" class="btn-secondary" (click)="resetFilters()">RESETUJ</button>
        </form>
      </div>
    </header>

    <main class="container">
      @if (loading()) {
        <p class="muted">Učitavanje...</p>
      } @else if (properties().length === 0) {
        <div class="empty-state">
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">Nema rezultata</p>
          <p class="muted">Pokušajte sa drugačijim filterima.</p>
        </div>
      } @else {
        @if (topRated(); as top) {
          @if ((query.page ?? 1) === 1) {
            <section class="section">
              <div class="flex-between" style="margin-bottom: 1.25rem;">
                <h2 style="font-size: 1.6rem;">⭐ IZDVOJENI SMEŠTAJ</h2>
              </div>
              <a [routerLink]="['/properties', top.id]" class="spotlight-card">
                <span class="top-badge">NAJBOLJE OCENJEN</span>
                <img class="spotlight-image" [src]="resolveImage(top.imagePath)" alt="{{ top.name }}" />
                <div class="spotlight-body">
                  <h3 style="font-size: 1.5rem;">{{ top.name }}</h3>
                  <p class="muted" style="margin: 0.3rem 0 1.25rem;">📍 {{ top.city }}, {{ top.country }}</p>
                  <div class="flex-between" style="border-bottom: 1px solid var(--color-border); padding-bottom: 1rem; margin-bottom: 1rem;">
                    <div>
                      <div class="price-tag" style="font-size: 1.6rem;">€{{ top.lowestPrice | number: '1.0-2' }}</div>
                      <div class="price-tag-label">po noći</div>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-weight: 800; font-size: 1.3rem;">{{ top.rating | number: '1.1-1' }}</div>
                      <div class="price-tag-label">⭐ ocena</div>
                    </div>
                  </div>
                  <div class="flex-between muted" style="font-size: 0.9rem; font-weight: 600;">
                    <span>🛏️ {{ top.propertyRoomsNumber }} soba</span>
                    <span>👥 do {{ top.highestCapacity }} gostiju</span>
                  </div>
                </div>
              </a>
            </section>
          }
        }

        <section class="section">
          <h2 style="font-size: 1.6rem; margin-bottom: 1.25rem;">SVI SMEŠTAJI</h2>
          <div class="grid-cards">
            @for (property of properties(); track property.id) {
              <a [routerLink]="['/properties', property.id]" class="property-card">
                <img class="thumb" style="height: 180px;" [src]="resolveImage(property.imagePath)" alt="{{ property.name }}" />
                <div class="property-card-body">
                  <h3 style="font-size: 1rem;">{{ property.name }}</h3>
                  <p class="muted" style="margin: 0.2rem 0 0.6rem; font-size: 0.85rem;">📍 {{ property.city }}, {{ property.country }}</p>
                  <div class="flex-between" style="border-bottom: 1px solid #f0f0f0; padding-bottom: 0.7rem; margin-bottom: 0.7rem;">
                    <div>
                      <div class="price-tag" style="font-size: 1.05rem;">€{{ property.lowestPrice | number: '1.0-2' }}</div>
                      <div class="price-tag-label">po noći</div>
                    </div>
                    @if (property.rating) {
                      <div style="text-align: right;">
                        <div style="font-weight: 700; font-size: 0.9rem;">{{ property.rating | number: '1.1-1' }}</div>
                        <div class="price-tag-label">⭐</div>
                      </div>
                    }
                  </div>
                  <div class="flex-between muted" style="font-size: 0.78rem; margin-bottom: 0.7rem;">
                    <span>🛏️ {{ property.propertyRoomsNumber }} soba</span>
                    <span>👥 do {{ property.highestCapacity }}</span>
                  </div>
                  @if (property.amenities.length) {
                    <div style="margin-bottom: 0.6rem;">
                      @for (amenity of property.amenities.slice(0, 3); track amenity) {
                        <span class="chip" style="margin-right: 0.3rem;">{{ amenity }}</span>
                      }
                      @if (property.amenities.length > 3) {
                        <span class="chip">+{{ property.amenities.length - 3 }}</span>
                      }
                    </div>
                  }
                  <span class="chip" style="background: #eef2e5; color: #556b2f;">{{ property.propertyType }}</span>
                </div>
              </a>
            }
          </div>

          <app-paginator [page]="query.page ?? 1" [totalPages]="totalPages()" (pageChange)="search($event)"></app-paginator>
        </section>
      }
    </main>
  `,
  styles: [`
    .hero {
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
      padding: 4.5rem 1.5rem;
      text-align: center;
      color: #fff;
    }
    .hero-inner {
      max-width: 900px;
      margin: 0 auto;
    }
    .hero-title {
      font-size: 2.6rem;
      font-weight: 800;
      letter-spacing: -1px;
      margin-bottom: 0.75rem;
      color: #fff;
    }
    .hero-subtitle {
      font-size: 1.05rem;
      opacity: 0.95;
      font-weight: 500;
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    .hero-stats {
      display: flex;
      gap: 0.85rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    .hero-stat {
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.3);
      padding: 0.7rem 1.4rem;
      font-size: 0.8rem;
      font-weight: 700;
    }
    .filter-bar {
      background: #fff;
      border-bottom: 1px solid var(--color-border);
      position: sticky;
      top: 0;
      z-index: 5;
      padding: 1.25rem 0;
    }
    .filter-title {
      font-size: 1.2rem;
      color: var(--color-primary);
      margin-bottom: 0.9rem;
    }
    .filter-row {
      display: flex;
      gap: 0.7rem;
      flex-wrap: wrap;
      align-items: center;
    }
    .filter-input {
      flex: 1;
      min-width: 160px;
    }
    .property-card {
      display: block;
      background: #fff;
      border: 1px solid var(--color-border);
      color: inherit;
      transition: all 0.2s ease;
      position: relative;
    }
    .property-card:hover {
      border-color: var(--color-primary);
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(107, 142, 35, 0.12);
      text-decoration: none;
    }
    .property-card-body {
      padding: 1.1rem;
    }
    .top-badge {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      background: var(--color-primary);
      color: #fff;
      padding: 0.3rem 0.7rem;
      font-size: 0.7rem;
      font-weight: 700;
      z-index: 2;
    }
    .spotlight-card {
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      background: #fff;
      border: 2px solid var(--color-primary);
      color: inherit;
      position: relative;
      overflow: hidden;
      transition: box-shadow 0.2s ease;
    }
    .spotlight-card:hover {
      box-shadow: 0 16px 32px rgba(107, 142, 35, 0.15);
      text-decoration: none;
    }
    .spotlight-image {
      width: 100%;
      height: 100%;
      min-height: 260px;
      object-fit: cover;
      background: linear-gradient(135deg, #e8ecd8 0%, #d4dfc2 100%);
    }
    .spotlight-body {
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    @media (max-width: 720px) {
      .spotlight-card {
        grid-template-columns: 1fr;
      }
      .spotlight-image {
        min-height: 200px;
      }
    }
  `],
})
export class PropertyListComponent implements OnInit {
  query: PropertySearchDto = { page: 1, pageSize: 6 };
  properties = signal<PropertyListItemDto[]>([]);
  totalPages = signal(1);
  totalCount = signal(0);
  loading = signal(false);

  priceRanges = PRICE_RANGES;
  selectedPriceRange = PRICE_RANGES[0];

  cities = signal<string[]>([]);
  countries = signal<string[]>([]);

  topRated = computed<PropertyListItemDto | null>(() => {
    const rated = [...this.properties()].filter((p) => p.rating);
    if (!rated.length) return null;
    return rated.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0];
  });

  avgRating = computed(() => {
    const rated = this.properties().filter((p) => p.rating);
    if (!rated.length) return null;
    return rated.reduce((sum, p) => sum + (p.rating ?? 0), 0) / rated.length;
  });

  private filterDebounce: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly propertyService: PropertyService,
    private readonly lookupService: LookupService,
  ) {}

  ngOnInit(): void {
    this.search(1);
    this.loadFilters();
  }

  private loadFilters(): void {
    this.lookupService.getDestinations().subscribe((destinations) => {
      const uniqueCities = Array.from(new Set(destinations.map((d) => d.city))).sort();
      this.cities.set(uniqueCities);
    });
    this.lookupService.getCountries().subscribe((countries) => {
      const uniqueCountries = Array.from(new Set(countries.map((c) => c.name))).sort();
      this.countries.set(uniqueCountries);
    });
  }

  onFilterChange(): void {
    if (this.filterDebounce) {
      clearTimeout(this.filterDebounce);
    }
    this.filterDebounce = setTimeout(() => this.search(1), 400);
  }

  onPriceRangeChange(): void {
    this.query.minPrice = this.selectedPriceRange.min;
    this.query.maxPrice = this.selectedPriceRange.max;
    this.search(1);
  }

  search(page: number): void {
    this.query.page = page;
    this.loading.set(true);
    this.propertyService.search(this.query).subscribe({
      next: (result) => {
        this.properties.set(result.items);
        this.totalPages.set(result.totalPages || 1);
        this.totalCount.set(result.totalCount);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  resetFilters(): void {
    this.query = { page: 1, pageSize: 12 };
    this.selectedPriceRange = this.priceRanges[0];
    this.search(1);
  }

  resolveImage(path: string): string {
    return resolveImageUrl(path);
  }
}
