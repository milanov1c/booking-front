export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface JwtTokenResponse {
  token: string;
  refreshToken: string;
}

export interface RegisterUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleId: number;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

// The API writes claims manually onto the JWT, so ASP.NET's ClaimTypes.Role
// ends up in the token payload under its full URI, not the short "role" key.
export const ROLE_CLAIM_TYPE = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

export interface DecodedToken {
  Id?: string;
  FirstName?: string;
  LastName?: string;
  Email?: string;
  exp?: number;
  [ROLE_CLAIM_TYPE]: string;
  [key: string]: unknown;
}

export interface CurrentUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}
