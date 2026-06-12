export type RideStatus =
  | 'pending'
  | 'accepted'
  | 'in-progress'
  | 'completed'
  | 'cancelled';

export type Driver = {
  id: string;
  name: string;
};

export type Location = {
  id: string;
  name: string;
  address: string;
};

export type SavedRoute = {
  id: string;
  name: string;
  pickup: string;
  dropoff: string;
};

export type Ride = {
  id: string;
  pickup: string;
  dropoff: string;
  status: RideStatus;
  driverId: string | null;
  distMiles: number | null;
  createdAt: string;
  completedAt?: string;
  cancelledAt?: string;
};

export type FareSettings = {
  baseFare: number;
  perMile: number;
};
