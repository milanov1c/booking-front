export interface PropertyRoomDto {
  id: number;
  propertyId: number;
  name: string;
  capacity: number;
  images: string[];
}

export interface PropertyDto {
  id: number;
  name: string;
  description: string;
  address: string;
  propertyType: string;
  city: string;
  country: string;
  rating: number | null;
  images: string[];
  rooms: PropertyRoomDto[];
  amenities: string[];
}

export interface PropertyListItemDto {
  id: number;
  name: string;
  description: string;
  address: string;
  propertyType: string;
  city: string;
  country: string;
  imagePath: string;
  propertyRoomsNumber: number;
  lowestPrice: number;
  highestPrice: number;
  lowestCapacity: number;
  highestCapacity: number;
  rating: number | null;
  amenities: string[];
}

export interface PropertySearchDto {
  name?: string;
  city?: string;
  country?: string;
  minCapacity?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
}

export interface UpdatePropertyDto {
  id: number;
  name: string;
  description: string;
  address: string;
  propertyTypeId: number;
  destinationId: number;
}

export interface AddPropertyRoomDto {
  name: string;
  capacity: number;
  propertyId: number;
}

export interface UpdatePropertyRoomDto {
  id: number;
  name: string;
  capacity: number;
}

export interface CheckPropertyRoomAvailabilityDto {
  propertyRoomId: number;
  startDate: string;
  endDate: string;
}

export interface PropertyRoomAvailabilityDto {
  propertyRoomId: number;
  startDate: string;
  endDate: string;
  isAvailable: boolean;
  priceIsSet: boolean;
}

export interface AttachPriceDto {
  propertyRoomId: number;
  startDate: string;
  endDate?: string | null;
  price: number;
}

export interface UpdatePropertyRoomPriceDto {
  id: number;
  date: string;
  price: number;
}

export interface PropertyRoomPriceDto {
  id: number;
  date: string;
  price: number;
}

export interface PropertyTypeDto {
  id: number;
  name: string;
}
