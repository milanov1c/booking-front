import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-paginator',
  standalone: true,
  template: `
    @if (totalPages > 1) {
      <div class="pagination">
        <button class="btn-secondary btn-sm" [disabled]="page <= 1" (click)="pageChange.emit(page - 1)">
          &larr; Prethodna
        </button>
        <span class="muted">Strana {{ page }} od {{ totalPages }}</span>
        <button class="btn-secondary btn-sm" [disabled]="page >= totalPages" (click)="pageChange.emit(page + 1)">
          Sledeća &rarr;
        </button>
      </div>
    }
  `,
})
export class PaginatorComponent {
  @Input() page = 1;
  @Input() totalPages = 1;
  @Output() pageChange = new EventEmitter<number>();
}
