import Constants from 'expo-constants';

const orsKey = (Constants.expoConfig?.extra as { orsKey?: string } | undefined)?.orsKey;

type GeoPoint = { lat: number; lon: number };

async function geocode(address: string): Promise<GeoPoint | null> {
  if (!orsKey) return null;

  try {
    const response = await fetch(
      `https://api.openrouteservice.org/geocode/search?api_key=${encodeURIComponent(
        orsKey
      )}&text=${encodeURIComponent(address)}&size=1`
    );
    const data = await response.json();
    const coords = data?.features?.[0]?.geometry?.coordinates;
    if (!coords) return null;
    return { lon: coords[0], lat: coords[1] };
  } catch {
    return null;
  }
}

export async function getDrivingDistanceMiles(
  pickup: string,
  dropoff: string
): Promise<number | null> {
  if (!orsKey) return null;

  try {
    const [p1, p2] = await Promise.all([geocode(pickup), geocode(dropoff)]);
    if (!p1 || !p2) return null;

    const response = await fetch(
      'https://api.openrouteservice.org/v2/directions/driving-car',
      {
        method: 'POST',
        headers: {
          Authorization: orsKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          coordinates: [
            [p1.lon, p1.lat],
            [p2.lon, p2.lat]
          ]
        })
      }
    );

    const data = await response.json();
    const meters = data?.routes?.[0]?.summary?.distance;
    if (typeof meters !== 'number') return null;

    return Number((meters / 1609.34).toFixed(1));
  } catch {
    return null;
  }
}
