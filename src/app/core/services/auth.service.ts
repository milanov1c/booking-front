import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ChangePasswordDto,
  CurrentUser,
  DecodedToken,
  JwtTokenResponse,
  LoginRequest,
  RegisterUserDto,
  RoleListItemDto,
  ROLE_CLAIM_TYPE,
} from '../models';

const ACCESS_TOKEN_KEY = 'booking_access_token';
const REFRESH_TOKEN_KEY = 'booking_refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/Auth`;

  private readonly currentUserSignal = signal<CurrentUser | null>(this.readUserFromStorage());
  readonly currentUser = computed(() => this.currentUserSignal());
  readonly isLoggedIn = computed(() => this.currentUserSignal() !== null);

  constructor(private readonly http: HttpClient) {}

  login(request: LoginRequest): Observable<JwtTokenResponse> {
    return this.http.post<JwtTokenResponse>(this.baseUrl, request).pipe(
      tap((response) => this.storeSession(response)),
    );
  }

  register(request: RegisterUserDto): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/Register`, request);
  }

  // Public list of roles a new user may self-register as (Admin is excluded
  // server-side). GET /api/Role itself requires Admin auth, so registration
  // uses this dedicated anonymous endpoint instead.
  getRegistrableRoles(): Observable<RoleListItemDto[]> {
    return this.http.get<RoleListItemDto[]>(`${environment.apiUrl}/Register/roles`);
  }

  refresh(): Observable<JwtTokenResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<JwtTokenResponse>(`${this.baseUrl}/refresh`, { refreshToken }).pipe(
      tap((response) => this.storeSession(response)),
    );
  }

  logout(): void {
    this.http.post<void>(`${this.baseUrl}/logout`, {}).subscribe({
      complete: () => this.clearSession(),
      error: () => this.clearSession(),
    });
  }

  changePassword(dto: ChangePasswordDto): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/User/password`, dto);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  hasRole(...roles: string[]): boolean {
    const user = this.currentUserSignal();
    return !!user && roles.some((r) => r.toLowerCase() === user.role.toLowerCase());
  }

  private storeSession(response: JwtTokenResponse): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, response.token);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    this.currentUserSignal.set(this.decodeUser(response.token));
  }

  private clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.currentUserSignal.set(null);
  }

  private readUserFromStorage(): CurrentUser | null {
    const token = this.getAccessToken();
    if (!token) {
      return null;
    }
    const user = this.decodeUser(token);
    if (!user) {
      this.clearSession();
      return null;
    }
    return user;
  }

  private decodeUser(token: string): CurrentUser | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as DecodedToken;
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return null;
      }
      return {
        id: Number(payload['Id']),
        firstName: String(payload['FirstName'] ?? ''),
        lastName: String(payload['LastName'] ?? ''),
        email: String(payload['Email'] ?? ''),
        role: String(payload[ROLE_CLAIM_TYPE] ?? ''),
      };
    } catch {
      return null;
    }
  }
}
