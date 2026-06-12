import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { FareSettings, Driver, Location, Ride, SavedRoute } from '../types';
import { getDrivingDistanceMiles } from '../lib/routeService';

const seedDrivers: Driver[] = [
  { id: 'd1', name: 'Marcus T.' },
  { id: 'd2', name: 'Priya S.' },
  { id: 'd3', name: 'James R.' }
];

const seedLocations: Location[] = [
  { id: 'l1', name: 'Dulles Airport', address: '1 Saarinen Cir, Dulles, VA 20166' },
  { id: 'l2', name: 'BWI Airport', address: '7050 Friendship Rd, Baltimore, MD 21240' }
];

const defaultFare: FareSettings = {
  baseFare: 10,
  perMile: 2.5
};

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function calcFare(
  baseFare: number,
  perMile: number,
  distMiles: number | null
): string {
  if (distMiles == null || Number.isNaN(distMiles)) return 'N/A';
  return (baseFare + perMile * distMiles).toFixed(2);
}

export function formatRideLabel(iso: string): string {
  const ts = new Date(iso);
  return (
    ts.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
    ' · ' +
    ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
}

type StoreState = {
  drivers: Driver[];
  locations: Location[];
  savedRoutes: SavedRoute[];
  rides: Ride[];
  fare: FareSettings;
  busy: boolean;
  error: string | null;
  createRide: (pickup: string, dropoff: string) => Promise<void>;
  claimRide: (rideId: string, driverId: string) => void;
  startRide: (rideId: string) => void;
  completeRide: (rideId: string) => void;
  cancelRide: (rideId: string) => void;
  addDriver: (name: string) => void;
  removeDriver: (driverId: string) => void;
  addLocation: (name: string, address: string) => void;
  removeLocation: (locationId: string) => void;
  saveRoute: (name: string, pickup: string, dropoff: string) => void;
  deleteRoute: (routeId: string) => void;
  updateFare: (baseFare: number, perMile: number) => void;
  clearError: () => void;
};

export const useAppStore = create<StoreState>()(
  persist(
    (set, get) => ({
      drivers: seedDrivers,
      locations: seedLocations,
      savedRoutes: [],
      rides: [],
      fare: defaultFare,
      busy: false,
      error: null,

      clearError: () => set({ error: null }),

      async createRide(pickup, dropoff) {
        const trimmedPickup = pickup.trim();
        const trimmedDropoff = dropoff.trim();

        if (!trimmedPickup || !trimmedDropoff || trimmedPickup === trimmedDropoff) {
          set({ error: 'Pickup and dropoff must both be present and different.' });
          return;
        }

        set({ busy: true, error: null });

        try {
          const distMiles = await getDrivingDistanceMiles(trimmedPickup, trimmedDropoff);

          const ride: Ride = {
            id: makeId('ride'),
            pickup: trimmedPickup,
            dropoff: trimmedDropoff,
            status: 'pending',
            driverId: null,
            distMiles,
            createdAt: new Date().toISOString()
          };

          set((state) => ({
            rides: [ride, ...state.rides],
            busy: false
          }));
        } catch {
          set({ busy: false, error: 'Unable to create ride.' });
        }
      },

      claimRide(rideId, driverId) {
        set((state) => ({
          rides: state.rides.map((ride) =>
            ride.id === rideId
              ? { ...ride, status: 'accepted', driverId }
              : ride
          )
        }));
      },

      startRide(rideId) {
        set((state) => ({
          rides: state.rides.map((ride) =>
            ride.id === rideId ? { ...ride, status: 'in-progress' } : ride
          )
        }));
      },

      completeRide(rideId) {
        set((state) => ({
          rides: state.rides.map((ride) =>
            ride.id === rideId
              ? {
                  ...ride,
                  status: 'completed',
                  completedAt: new Date().toISOString()
                }
              : ride
          )
        }));
      },

      cancelRide(rideId) {
        set((state) => ({
          rides: state.rides.map((ride) =>
            ride.id === rideId
              ? {
                  ...ride,
                  status: 'cancelled',
                  cancelledAt: new Date().toISOString()
                }
              : ride
          )
        }));
      },

      addDriver(name) {
        const clean = name.trim();
        if (!clean) return;
        set((state) => ({
          drivers: [...state.drivers, { id: makeId('driver'), name: clean }]
        }));
      },

      removeDriver(driverId) {
        set((state) => ({
          drivers: state.drivers.filter((driver) => driver.id !== driverId),
          rides: state.rides.map((ride) =>
            ride.driverId === driverId
              ? { ...ride, driverId: null, status: 'pending' }
              : ride
          )
        }));
      },

      addLocation(name, address) {
        const cleanName = name.trim();
        const cleanAddress = address.trim();
        if (!cleanName || !cleanAddress) return;

        set((state) => ({
          locations: [
            ...state.locations,
            { id: makeId('loc'), name: cleanName, address: cleanAddress }
          ]
        }));
      },

      removeLocation(locationId) {
        set((state) => ({
          locations: state.locations.filter((loc) => loc.id !== locationId)
        }));
      },

      saveRoute(name, pickup, dropoff) {
        const cleanName = name.trim();
        const cleanPickup = pickup.trim();
        const cleanDropoff = dropoff.trim();
        if (!cleanName || !cleanPickup || !cleanDropoff) return;

        set((state) => ({
          savedRoutes: [
            ...state.savedRoutes,
            {
              id: makeId('route'),
              name: cleanName,
              pickup: cleanPickup,
              dropoff: cleanDropoff
            }
          ]
        }));
      },

      deleteRoute(routeId) {
        set((state) => ({
          savedRoutes: state.savedRoutes.filter((route) => route.id !== routeId)
        }));
      },

      updateFare(baseFare, perMile) {
        set({
          fare: {
            baseFare: Number.isFinite(baseFare) ? baseFare : defaultFare.baseFare,
            perMile: Number.isFinite(perMile) ? perMile : defaultFare.perMile
          }
        });
      }
    }),
    {
      name: 'mvma-mobile-store',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
