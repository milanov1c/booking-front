import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuditLogService } from '../../../core/services/audit-log.service';
import { AuditLogDto, AuditLogSearchDto } from '../../../core/models';
import { PaginatorComponent } from '../../../shared/paginator/paginator.component';

@Component({
  selector: 'app-admin-audit-log',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginatorComponent],
  template: `
    <div class="container">
      <h1>Audit log</h1>

      <div class="card section">
        <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); align-items: end;">
          <div class="form-field" style="margin-bottom: 0;">
            <label>Email korisnika</label>
            <input [(ngModel)]="query.userEmail" name="userEmail" />
          </div>
          <div class="form-field" style="margin-bottom: 0;">
            <label>Komanda</label>
            <input [(ngModel)]="query.commandName" name="commandName" />
          </div>
          <div class="form-field" style="margin-bottom: 0;">
            <label>Status</label>
            <select [(ngModel)]="query.success" name="success">
              <option [ngValue]="undefined">Svi</option>
              <option [ngValue]="true">Uspešno</option>
              <option [ngValue]="false">Neuspešno</option>
            </select>
          </div>
          <button (click)="search(1)">Pretraži</button>
        </div>
      </div>

      <table>
        <thead>
          <tr><th>Vreme</th><th>Korisnik</th><th>Komanda</th><th>Status</th><th>Greška</th></tr>
        </thead>
        <tbody>
          @for (log of logs(); track log.id) {
            <tr>
              <td>{{ log.executedAt | date: 'dd.MM.yyyy. HH:mm' }}</td>
              <td>{{ log.userEmail }}</td>
              <td>{{ log.commandName }}</td>
              <td>
                <span class="badge" [class]="log.success ? 'badge-confirmed' : 'badge-cancelled'">
                  {{ log.success ? 'OK' : 'Greška' }}
                </span>
              </td>
              <td class="muted">{{ log.errorMessage }}</td>
            </tr>
          }
        </tbody>
      </table>

      <app-paginator [page]="page()" [totalPages]="totalPages()" (pageChange)="search($event)"></app-paginator>
    </div>
  `,
})
export class AdminAuditLogComponent implements OnInit {
  query: AuditLogSearchDto = { page: 1, pageSize: 20 };
  logs = signal<AuditLogDto[]>([]);
  page = signal(1);
  totalPages = signal(1);

  constructor(private readonly auditLogService: AuditLogService) {}

  ngOnInit(): void {
    this.search(1);
  }

  search(page: number): void {
    this.query.page = page;
    this.auditLogService.search(this.query).subscribe((result) => {
      this.logs.set(result.items);
      this.page.set(result.page);
      this.totalPages.set(result.totalPages || 1);
    });
  }
}
