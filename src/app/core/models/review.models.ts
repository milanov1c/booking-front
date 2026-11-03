export interface ReviewDto {
  id: number;
  userId: number;
  userFullName: string;
  propertyId: number;
  propertyName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AddReviewDto {
  propertyId: number;
  rating: number;
  comment: string;
}

export interface UpdateReviewDto {
  id: number;
  rating: number;
  comment: string;
}
