import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LookupService } from '../../../core/services/lookup.service';
import { UserService } from '../../../core/services/user.service';
import { GetUsersSearchDto, RoleListItemDto, UserListItemDto } from '../../../core/models';
import { PaginatorComponent } from '../../../shared/paginator/paginator.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginatorComponent],
  template: `
    <div class="container">
      <h1>Korisnici</h1>

      <div class="card section">
        <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); align-items: end;">
          <div class="form-field" style="margin-bottom: 0;">
            <label>Email</label>
            <input [(ngModel)]="query.email" name="email" (keyup.enter)="search(1)" />
          </div>
          <div class="form-field" style="margin-bottom: 0;">
            <label>Uloga</label>
            <select [(ngModel)]="query.roleName" name="roleName">
              <option [ngValue]="undefined">Sve</option>
              @for (role of roles(); track role.id) {
                <option [ngValue]="role.name">{{ role.name }}</option>
              }
            </select>
          </div>
          <button (click)="search(1)">Pretraži</button>
        </div>
      </div>

      <table>
        <thead>
          <tr><th>Ime</th><th>Email</th><th>Uloga</th><th>Aktivan</th><th></th></tr>
        </thead>
        <tbody>
          @for (user of users(); track user.id) {
            <tr>
              <td>{{ user.firstName }} {{ user.lastName }}</td>
              <td>{{ user.email }}</td>
              <td>
                <select [ngModel]="user.roleName" (ngModelChange)="updateRole(user, $event)">
                  @for (role of roles(); track role.id) {
                    <option [ngValue]="role.name">{{ role.name }}</option>
                  }
                </select>
              </td>
              <td>
                <span class="badge" [class]="user.isActive ? 'badge-confirmed' : 'badge-cancelled'">
                  {{ user.isActive ? 'Aktivan' : 'Neaktivan' }}
                </span>
              </td>
              <td>
                <button class="btn-sm" [class.btn-secondary]="user.isActive" (click)="toggleStatus(user)">
                  {{ user.isActive ? 'Deaktiviraj' : 'Aktiviraj' }}
                </button>
              </td>
            </tr>
          }
        </tbody>
      </table>

      <app-paginator [page]="page()" [totalPages]="totalPages()" (pageChange)="search($event)"></app-paginator>
    </div>
  `,
})
export class AdminUsersComponent implements OnInit {
  query: GetUsersSearchDto = { page: 1, pageSize: 20 };
  users = signal<UserListItemDto[]>([]);
  roles = signal<RoleListItemDto[]>([]);
  page = signal(1);
  totalPages = signal(1);

  constructor(private readonly userService: UserService, private readonly lookupService: LookupService) {}

  ngOnInit(): void {
    this.lookupService.getRoles().subscribe((roles) => this.roles.set(roles));
    this.search(1);
  }

  search(page: number): void {
    this.query.page = page;
    this.userService.search(this.query).subscribe((result) => {
      this.users.set(result.items);
      this.page.set(result.page);
      this.totalPages.set(result.totalPages || 1);
    });
  }

  updateRole(user: UserListItemDto, roleName: string): void {
    const role = this.roles().find((r) => r.name === roleName);
    if (!role) return;
    this.userService.updateRole(user.id, { userId: user.id, roleId: role.id }).subscribe(() => this.search(this.page()));
  }

  toggleStatus(user: UserListItemDto): void {
    this.userService
      .updateStatus(user.id, { userId: user.id, isActive: !user.isActive })
      .subscribe(() => this.search(this.page()));
  }
}
