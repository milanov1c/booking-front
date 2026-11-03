export interface AmenityDto {
  id: number;
  name: string;
}

export interface AddAmenityDto {
  name: string;
}

export interface AttachAmenityDto {
  propertyId: number;
  amenityId: number;
}

export interface CountryDto {
  id: number;
  name: string;
}

export interface AddCountryDto {
  name: string;
}

export interface DestinationDto {
  id: number;
  city: string;
  countryId: number;
  countryName: string;
}

export interface AddDestinationDto {
  name: string;
  countryId: number;
}

export interface RoleListItemDto {
  id: number;
  name: string;
}

export interface AddRoleDto {
  name: string;
}

export interface UseCaseListItemDto {
  id: number;
  useCaseId: string;
  name: string;
}

export interface AddUseCaseDto {
  name: string;
  useCaseId: string;
}

export interface AttachUseCaseDto {
  roleId: number;
  useCaseId: number;
}
