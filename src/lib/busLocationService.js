import { supabase, isSupabaseConfigured } from './supabase.js';

/**
 * Service to interact with public.bus_locations, public.trips, and Supabase Realtime
 */

/**
 * Calculate distance between two lat/lng points in meters (Haversine formula)
 */
export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 0;
  const R = 6371e3; // Earth radius in metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Normalizes a raw bus_locations row into a standard client object
 */
export const normalizeLocationRow = (row) => {
  if (!row) return null;
  const lat = row.latitude ?? row.lat;
  const lng = row.longitude ?? row.lng;
  if (lat == null || lng == null) return null;

  return {
    id: row.id,
    tripId: row.trip_id,
    busId: row.bus_id,
    latitude: Number(lat),
    longitude: Number(lng),
    speedKph: row.speed_kph != null ? Number(row.speed_kph) : (row.speed != null ? Number(row.speed) : null),
    heading: row.heading != null ? Number(row.heading) : null,
    recordedAt: row.recorded_at || row.created_at || new Date().toISOString(),
  };
};

/**
 * Resolves bus info from Supabase public.buses table
 */
export async function fetchBusDetails(busIdentifier) {
  if (!busIdentifier || !isSupabaseConfigured()) {
    return {
      id: busIdentifier,
      busNumber: busIdentifier,
      name: `Bus #${busIdentifier}`,
      model: null,
      capacity: null,
    };
  }

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(busIdentifier);
    let query = supabase.from('buses').select('*');
    if (isUuid) {
      query = query.or(`id.eq.${busIdentifier},bus_number.eq.${busIdentifier}`);
    } else {
      query = query.eq('bus_number', busIdentifier);
    }
    const { data } = await query.maybeSingle();

    if (data) {
      return {
        id: data.id,
        busNumber: data.bus_number,
        name: `Bus #${data.bus_number}`,
        model: data.model,
        capacity: data.capacity,
      };
    }

    return {
      id: busIdentifier,
      busNumber: busIdentifier,
      name: `Bus #${busIdentifier}`,
      model: null,
      capacity: null,
    };
  } catch (e) {
    console.warn('Error fetching bus details from Supabase:', e);
    return {
      id: busIdentifier,
      busNumber: busIdentifier,
      name: `Bus #${busIdentifier}`,
      model: null,
      capacity: null,
    };
  }
}

/**
 * Loads real route and route_stops from Supabase for a trip or bus.
 * Returns { route: null, stops: [] } if no records exist in the database.
 * NEVER uses mock data or fake coordinates.
 */
export async function fetchRouteAndStopsForTripOrBus({ tripId, busId } = {}) {
  if (!isSupabaseConfigured()) {
    return { route: null, stops: [] };
  }

  try {
    let targetRouteId = null;

    // 1. If tripId is provided, get route_id from trips table
    if (tripId) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tripId);
      if (isUuid) {
        const { data: trip } = await supabase
          .from('trips')
          .select('route_id')
          .eq('id', tripId)
          .maybeSingle();

        if (trip?.route_id) {
          targetRouteId = trip.route_id;
        }
      }
    }

    // 2. If no targetRouteId, resolve from active trip of the bus
    if (!targetRouteId && busId) {
      const activeTrip = await getActiveTripForBus(busId);
      if (activeTrip?.route_id) {
        targetRouteId = activeTrip.route_id;
      }
    }

    // 3. If targetRouteId is found, query real routes and route_stops
    if (targetRouteId) {
      const [routeRes, stopsRes] = await Promise.all([
        supabase.from('routes').select('*').eq('id', targetRouteId).maybeSingle(),
        supabase
          .from('route_stops')
          .select('*')
          .eq('route_id', targetRouteId)
          .order('stop_order', { ascending: true }),
      ]);

      const routeRow = routeRes?.data;
      const stopRows = stopsRes?.data || [];

      return {
        route: routeRow
          ? {
              id: routeRow.id,
              routeNumber: routeRow.route_number,
              name: routeRow.name,
              description: routeRow.description,
            }
          : null,
        stops: stopRows
          .map((s) => ({
            id: s.id,
            name: s.stop_name,
            order: s.stop_order,
            lat: s.latitude != null ? Number(s.latitude) : null,
            lng: s.longitude != null ? Number(s.longitude) : null,
          }))
          .filter((s) => s.lat != null && s.lng != null),
      };
    }

    // No route or stops registered in Supabase
    return { route: null, stops: [] };
  } catch (err) {
    console.warn('Error fetching route and stops from Supabase:', err);
    return { route: null, stops: [] };
  }
}

/**
 * Resolves a bus UUID from a bus number or ID (e.g. '42B')
 */
export async function resolveBusUuid(busIdentifier) {
  if (!busIdentifier || !isSupabaseConfigured()) return null;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(busIdentifier);
  if (isUuid) return busIdentifier;

  try {
    const { data, error } = await supabase
      .from('buses')
      .select('id')
      .eq('bus_number', busIdentifier)
      .maybeSingle();

    if (!error && data?.id) {
      return data.id;
    }
    return null;
  } catch (e) {
    console.warn('Error resolving bus UUID:', e);
    return null;
  }
}

/**
 * Resolves the active trip row for a given bus identifier
 */
export async function getActiveTripForBus(busIdentifier) {
  if (!busIdentifier || !isSupabaseConfigured()) return null;

  try {
    // 1. If busIdentifier is a UUID, check if it's directly a trip ID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(busIdentifier);
    if (isUuid) {
      const { data: tripDirect } = await supabase
        .from('trips')
        .select('*')
        .eq('id', busIdentifier)
        .maybeSingle();

      if (tripDirect) return tripDirect;
    }

    // 2. Resolve bus UUID
    let busUuid = await resolveBusUuid(busIdentifier);
    if (!busUuid && isUuid) {
      busUuid = busIdentifier;
    }

    if (busUuid) {
      // Find in_progress trip
      const { data: activeTrip } = await supabase
        .from('trips')
        .select('*')
        .eq('bus_id', busUuid)
        .in('status', ['in_progress', 'active', 'ACTIVE', 'IN_PROGRESS'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activeTrip) return activeTrip;

      // Check most recent trip for this bus
      const { data: recentTrip } = await supabase
        .from('trips')
        .select('*')
        .eq('bus_id', busUuid)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recentTrip) return recentTrip;
    }

    return null;
  } catch (err) {
    console.warn('Error getting active trip for bus:', err);
    return null;
  }
}

/**
 * Finds or creates an active trip for a bus in public.trips (used when driver starts location sharing)
 */
export async function findOrCreateActiveTrip({ busNumber = '42B', tripId = null } = {}) {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    // 1. If an explicit tripId was passed, verify it exists
    if (tripId) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tripId);
      if (isUuid) {
        const { data: tripRow } = await supabase
          .from('trips')
          .select('*')
          .eq('id', tripId)
          .maybeSingle();

        if (tripRow) {
          return { success: true, trip: tripRow, tripId: tripRow.id, busId: tripRow.bus_id };
        }
      }
    }

    // 2. Look up the bus UUID by bus_number
    let busUuid = await resolveBusUuid(busNumber);

    // If bus not found in database, check if any bus exists
    if (!busUuid) {
      const { data: anyBus } = await supabase
        .from('buses')
        .select('id, bus_number')
        .limit(1)
        .maybeSingle();

      if (anyBus?.id) {
        busUuid = anyBus.id;
      }
    }

    // 3. Search for active trips for this bus in `trips`
    if (busUuid) {
      const { data: activeTrip } = await supabase
        .from('trips')
        .select('*')
        .eq('bus_id', busUuid)
        .in('status', ['in_progress', 'active', 'ACTIVE', 'IN_PROGRESS'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activeTrip) {
        return { success: true, trip: activeTrip, tripId: activeTrip.id, busId: busUuid };
      }

      // Check any recent trip for this bus
      const { data: anyBusTrip } = await supabase
        .from('trips')
        .select('*')
        .eq('bus_id', busUuid)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (anyBusTrip) {
        return { success: true, trip: anyBusTrip, tripId: anyBusTrip.id, busId: busUuid };
      }

      // Try to create an active trip for this bus
      const { data: newTrip, error: createTripError } = await supabase
        .from('trips')
        .insert({
          bus_id: busUuid,
          status: 'in_progress',
        })
        .select('*')
        .maybeSingle();

      if (!createTripError && newTrip) {
        return { success: true, trip: newTrip, tripId: newTrip.id, busId: busUuid };
      }
    }

    // 4. Fallback: check if ANY trip exists in the trips table
    const { data: globalTrip } = await supabase
      .from('trips')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (globalTrip) {
      return { success: true, trip: globalTrip, tripId: globalTrip.id, busId: globalTrip.bus_id };
    }

    return {
      success: false,
      error: 'No active trip found. Please ensure a trip is registered in the trips table.',
    };
  } catch (err) {
    console.warn('Error in findOrCreateActiveTrip:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Record a single driver location in public.bus_locations
 * Driver's browser navigator.geolocation.watchPosition is the sole source.
 */
export async function recordDriverLocation({
  tripId,
  busId,
  latitude,
  longitude,
  speedKph = null,
  speed = null,
  heading = 0,
  timestamp,
}) {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase credentials not configured' };
  }

  if (!tripId) {
    return { success: false, error: 'No active trip_id provided for location recording' };
  }

  // Calculate speed in km/h accurately
  let finalSpeedKph = 0;
  if (speedKph != null && !isNaN(speedKph)) {
    finalSpeedKph = Math.max(0, Math.round(Number(speedKph)));
  } else if (speed != null && !isNaN(speed)) {
    finalSpeedKph = Math.max(0, Math.round(Number(speed) * 3.6));
  }

  const payload = {
    trip_id: tripId,
    latitude: Number(latitude),
    longitude: Number(longitude),
    heading: heading != null && !isNaN(heading) && heading >= 0 ? Math.round(Number(heading)) : 0,
    speed_kph: finalSpeedKph,
    recorded_at: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('bus_locations')
      .insert(payload)
      .select();

    if (error) {
      if (error.code === '42501') {
        return {
          success: false,
          error: 'Row-level security policy: Driver authentication required to write location to Supabase.',
          code: '42501',
        };
      }
      return { success: false, error: error.message, code: error.code };
    }

    return { success: true, data: data?.[0] ? normalizeLocationRow(data[0]) : payload };
  } catch (err) {
    console.error('Exception writing location to public.bus_locations:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch the latest live location for the given trip or bus from public.bus_locations.
 * Returns NULL if no location record exists in Supabase.
 * NEVER returns fallback, mock, or random coordinates.
 */
export async function fetchLatestBusLocation({ tripId, busId } = {}) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    let resolvedTripId = tripId;

    // If tripId was not directly provided, resolve active trip for this bus
    if (!resolvedTripId && busId) {
      const activeTrip = await getActiveTripForBus(busId);
      if (activeTrip?.id) {
        resolvedTripId = activeTrip.id;
      }
    }

    if (resolvedTripId) {
      const { data, error } = await supabase
        .from('bus_locations')
        .select('*')
        .eq('trip_id', resolvedTripId)
        .order('recorded_at', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        return normalizeLocationRow(data[0]);
      }
    }

    // No location recorded for this active trip in Supabase
    return null;
  } catch (err) {
    console.warn('Error fetching latest bus location from Supabase:', err);
    return null;
  }
}

/**
 * Fetch all recent active bus locations across trips (used for fleet overview without mock data)
 */
export async function fetchAllActiveBusLocations() {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('bus_locations')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(30);

    if (error || !data) return [];

    // Deduplicate by trip_id to get only the latest location per trip
    const seen = new Set();
    const unique = [];
    for (const row of data) {
      if (!seen.has(row.trip_id)) {
        seen.add(row.trip_id);
        const norm = normalizeLocationRow(row);
        if (norm) {
          unique.push(norm);
        }
      }
    }
    return unique;
  } catch (err) {
    console.warn('Error fetching all active bus locations:', err);
    return [];
  }
}

/**
 * Subscribe to real-time changes on public.bus_locations and public.trips tables
 */
export function subscribeToBusLocations({ tripId, busId, onLocationUpdate, onStatusChange }) {
  if (!isSupabaseConfigured()) {
    return () => {};
  }

  let resolvedTripId = tripId;
  const channelId = `bus-locs-${resolvedTripId || busId || 'all'}-${Math.random().toString(36).slice(2, 8)}`;
  const channel = supabase.channel(channelId);

  // If tripId is not known initially, resolve it in background
  if (!resolvedTripId && busId) {
    getActiveTripForBus(busId).then((trip) => {
      if (trip?.id) {
        resolvedTripId = trip.id;
      }
    });
  }

  const handlePayload = (payload) => {
    const newRow = payload?.new;
    if (!newRow) return;

    // If we have a resolved tripId, verify match
    if (resolvedTripId && newRow.trip_id !== resolvedTripId) {
      return;
    }

    const normalized = normalizeLocationRow(newRow);
    if (normalized && onLocationUpdate) {
      onLocationUpdate(normalized);
    }
  };

  const handleTripChange = (payload) => {
    const updatedTrip = payload?.new;
    if (!updatedTrip) return;

    if (resolvedTripId && updatedTrip.id !== resolvedTripId) {
      return;
    }

    if (updatedTrip.status === 'standby' || updatedTrip.status === 'completed' || updatedTrip.status === 'paused') {
      onStatusChange?.({ isTracking: false, status: updatedTrip.status });
    } else if (updatedTrip.status === 'in_progress' || updatedTrip.status === 'active') {
      onStatusChange?.({ isTracking: true, status: updatedTrip.status });
    }
  };

  channel
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'bus_locations',
        ...(resolvedTripId ? { filter: `trip_id=eq.${resolvedTripId}` } : {}),
      },
      handlePayload
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'bus_locations',
        ...(resolvedTripId ? { filter: `trip_id=eq.${resolvedTripId}` } : {}),
      },
      handlePayload
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'trips',
        ...(resolvedTripId ? { filter: `id=eq.${resolvedTripId}` } : {}),
      },
      handleTripChange
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
