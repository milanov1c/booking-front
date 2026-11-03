export type ReservationStatus = 'Pending' | 'Confirmed' | 'Cancelled';

export interface ReservationDto {
  id: number;
  propertyId: number;
  propertyName: string;
  propertyRoomId: number;
  propertyRoomName: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: ReservationStatus;
}

export interface LandlordReservationDto {
  id: number;
  name: string;
  tenant: string;
  startDate: string;
  endDate: string;
  propertyRoomName: string;
  status: ReservationStatus;
}

export interface AddReservationDto {
  propertyRoomId: number;
  startDate: string;
  endDate: string;
}

export interface ConfirmReservationDto {
  reservationId: number;
}

export interface CancelReservationDto {
  reservationId: number;
}

export interface GetUserReservationsQuery {
  page?: number;
  pageSize?: number;
}
