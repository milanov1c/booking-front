import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/properties/property-list/property-list.component').then((m) => m.PropertyListComponent),
  },
  {
    path: 'properties/:id',
    loadComponent: () =>
      import('./features/properties/property-detail/property-detail.component').then(
        (m) => m.PropertyDetailComponent,
      ),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'reservations',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/reservations/my-reservations/my-reservations.component').then(
        (m) => m.MyReservationsComponent,
      ),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'landlord',
    canActivate: [roleGuard('Landlord', 'Admin')],
    loadComponent: () =>
      import('./features/landlord/landlord-dashboard/landlord-dashboard.component').then(
        (m) => m.LandlordDashboardComponent,
      ),
  },
  {
    path: 'landlord/properties',
    canActivate: [roleGuard('Landlord', 'Admin')],
    loadComponent: () =>
      import('./features/landlord/landlord-properties/landlord-properties.component').then(
        (m) => m.LandlordPropertiesComponent,
      ),
  },
  {
    path: 'landlord/properties/:id',
    canActivate: [roleGuard('Landlord', 'Admin')],
    loadComponent: () =>
      import('./features/landlord/landlord-property-detail/landlord-property-detail.component').then(
        (m) => m.LandlordPropertyDetailComponent,
      ),
  },
  {
    path: 'landlord/reservations',
    canActivate: [roleGuard('Landlord', 'Admin')],
    loadComponent: () =>
      import('./features/landlord/landlord-reservations/landlord-reservations.component').then(
        (m) => m.LandlordReservationsComponent,
      ),
  },
  {
    path: 'admin/users',
    canActivate: [roleGuard('Admin')],
    loadComponent: () =>
      import('./features/admin/admin-users/admin-users.component').then((m) => m.AdminUsersComponent),
  },
  {
    path: 'admin/lookups',
    canActivate: [roleGuard('Admin')],
    loadComponent: () =>
      import('./features/admin/admin-lookups/admin-lookups.component').then((m) => m.AdminLookupsComponent),
  },
  {
    path: 'admin/audit-log',
    canActivate: [roleGuard('Admin')],
    loadComponent: () =>
      import('./features/admin/admin-audit-log/admin-audit-log.component').then(
        (m) => m.AdminAuditLogComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
