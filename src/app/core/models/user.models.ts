import { PropertyListItemDto } from './property.models';
import { ReservationDto } from './reservation.models';
import { ReviewDto } from './review.models';

export interface UserProfileDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  reservations: ReservationDto[];
  reviews: ReviewDto[];
  ownedProperties: PropertyListItemDto[];
}

export interface UserListItemDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roleName: string;
  isActive: boolean;
}

export interface GetUsersSearchDto {
  email?: string;
  roleName?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface UpdateUserRoleDto {
  userId: number;
  roleId: number;
}

export interface UpdateUserStatusDto {
  userId: number;
  isActive: boolean;
}

export interface LandlordStatsDto {
  totalProperties: number;
  totalPropertyRooms: number;
  totalReservations: number;
  confirmedReservations: number;
  pendingReservations: number;
  cancelledReservations: number;
  totalRevenue: number;
  averageRating: number | null;
}
