export type TripStatus = 'draft' | 'planned' | 'completed';

export type Trip = {
  id: string;
  userId: string;
  destination: string;
  status: TripStatus;
  createdAt: Date;
  updatedAt: Date;
};
