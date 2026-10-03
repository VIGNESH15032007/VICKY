// Realistic Mock Data for Real-Time Public Transport Tracking System

export const SYSTEM_INFO = {
  city: "Riverdale Metro & Oakridge Smart Transit Zone",
  version: "v4.2.8",
  gpsFeedStatus: "ONLINE",
  networkReliability: "94.2%",
  activeFleetCount: 24,
  totalFleetCount: 28,
  todayRiders: 14820,
  activeCorridorsCount: 8,
  liveTripsCount: 19
};

export const MOCK_BUSES = [
  {
    id: "42B",
    routeNumber: "42B",
    name: "Blue Express",
    routeId: "R104",
    routeName: "North Express Line",
    type: "Electric Low-Floor",
    model: "Volvo Electric CityBus 12m",
    plateNumber: "BP-4089",
    category: "Express",
    driver: {
      name: "Marcus Vance",
      id: "DRV-8492",
      phone: "+1 (555) 234-8492",
      rating: 4.9,
      shift: "06:00 - 14:30",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    },
    status: "ON_TIME",
    statusText: "On Schedule (+12s)",
    currentStop: "Willow Creek Stop",
    nextStop: "City Hospital",
    origin: "Central Station",
    destination: "West Ridge Terminal",
    eta: "3 min",
    speed: 38,
    speedLimit: 45,
    distanceToNextStop: "450 m",
    timeToNextStop: "1m 45s",
    boardingCount: 8,
    occupancy: {
      total: 42,
      available: 14,
      occupied: 28,
      percentage: 66.7,
      status: "Moderate",
      badgeColor: "tertiary"
    },
    telemetry: {
      gpsAccuracy: "±1.5m",
      refreshRate: "1.2s",
      battery: "78%",
      temperature: "21.5°C",
      lastPing: "Just now"
    }
  },
  {
    id: "12A",
    routeNumber: "12A",
    name: "Hillside Shuttle",
    routeId: "R12",
    routeName: "Greenfield Loop",
    type: "Single-Deck Hybrid",
    model: "BYD K9 Electric",
    plateNumber: "BP-3120",
    category: "Shuttle",
    driver: {
      name: "Sarah Chen",
      id: "DRV-6218",
      phone: "+1 (555) 492-6218",
      rating: 4.8,
      shift: "07:30 - 16:00",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80"
    },
    status: "DELAYED",
    statusText: "Slow Traffic (+4m)",
    currentStop: "Oak Plaza",
    nextStop: "Valley Crossing",
    origin: "Greenfield Heights",
    destination: "Greenfield Loop",
    eta: "7 min",
    speed: 18,
    speedLimit: 40,
    distanceToNextStop: "980 m",
    timeToNextStop: "4m 10s",
    boardingCount: 4,
    occupancy: {
      total: 36,
      available: 6,
      occupied: 30,
      percentage: 83.3,
      status: "Crowded",
      badgeColor: "amber-400"
    },
    telemetry: {
      gpsAccuracy: "±2.1m",
      refreshRate: "1.5s",
      battery: "64%",
      temperature: "23.0°C",
      lastPing: "2s ago"
    }
  },
  {
    id: "07",
    routeNumber: "07",
    name: "Downtown Circular",
    routeId: "R07",
    routeName: "Metro Core Ring",
    type: "Zero-Emission Transit",
    model: "Proterra ZX5 Max",
    plateNumber: "BP-1094",
    category: "Circular",
    driver: {
      name: "David Kim",
      id: "DRV-3041",
      phone: "+1 (555) 881-3041",
      rating: 4.95,
      shift: "08:00 - 16:30",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
    },
    status: "ON_TIME",
    statusText: "At Station",
    currentStop: "Central Station",
    nextStop: "City Hall Plaza",
    origin: "Market Interchange",
    destination: "Market Square Circular",
    eta: "At Station",
    speed: 0,
    speedLimit: 35,
    distanceToNextStop: "620 m",
    timeToNextStop: "Departs in 1m",
    boardingCount: 12,
    occupancy: {
      total: 40,
      available: 22,
      occupied: 18,
      percentage: 45.0,
      status: "Seats Free",
      badgeColor: "tertiary"
    },
    telemetry: {
      gpsAccuracy: "±1.0m",
      refreshRate: "1.0s",
      battery: "92%",
      temperature: "20.8°C",
      lastPing: "Just now"
    }
  },
  {
    id: "18",
    routeNumber: "18",
    name: "Valley Link",
    routeId: "R18",
    routeName: "East-West Connector",
    type: "High-Capacity Articulated",
    model: "New Flyer Excelsior",
    plateNumber: "BP-5521",
    category: "Regional",
    driver: {
      name: "Elena Gomez",
      id: "DRV-9014",
      phone: "+1 (555) 302-9014",
      rating: 4.75,
      shift: "06:30 - 15:00",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
    },
    status: "DELAYED",
    statusText: "Congestion (+6m)",
    currentStop: "Tech Park North",
    nextStop: "Suburban Junction",
    origin: "Tech Park Gateway",
    destination: "Valley Terminal",
    eta: "11 min",
    speed: 22,
    speedLimit: 50,
    distanceToNextStop: "1.4 km",
    timeToNextStop: "5m 30s",
    boardingCount: 7,
    occupancy: {
      total: 48,
      available: 16,
      occupied: 32,
      percentage: 66.7,
      status: "Moderate",
      badgeColor: "amber-400"
    },
    telemetry: {
      gpsAccuracy: "±1.8m",
      refreshRate: "1.8s",
      battery: "55%",
      temperature: "22.1°C",
      lastPing: "4s ago"
    }
  },
  {
    id: "15",
    routeNumber: "15",
    name: "River Rapid",
    routeId: "R15",
    routeName: "Waterfront Arterial",
    type: "Low-Emission Hybrid",
    model: "Nova Bus LFSe+",
    plateNumber: "BP-7703",
    category: "Express",
    driver: {
      name: "Jason Brooks",
      id: "DRV-7712",
      phone: "+1 (555) 714-7712",
      rating: 4.88,
      shift: "09:00 - 17:30",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
    },
    status: "DISRUPTED",
    statusText: "River Rd Detour Active",
    currentStop: "Harbor Gateway",
    nextStop: "Central Pier (Detour)",
    origin: "Riverdale South",
    destination: "Waterfront Marina",
    eta: "5 min",
    speed: 32,
    speedLimit: 45,
    distanceToNextStop: "820 m",
    timeToNextStop: "2m 50s",
    boardingCount: 5,
    occupancy: {
      total: 42,
      available: 18,
      occupied: 24,
      percentage: 57.1,
      status: "Moderate",
      badgeColor: "tertiary"
    },
    telemetry: {
      gpsAccuracy: "±1.4m",
      refreshRate: "1.2s",
      battery: "71%",
      temperature: "21.0°C",
      lastPing: "1s ago"
    }
  },
  {
    id: "04",
    routeNumber: "04",
    name: "South Depot Service",
    routeId: "R04",
    routeName: "Maintenance Connector",
    type: "Standard Diesel/Clean",
    model: "Gillig Low Floor",
    plateNumber: "BP-0044",
    category: "Depot",
    driver: {
      name: "Robert Miller",
      id: "DRV-1182",
      phone: "+1 (555) 902-1182",
      rating: 4.6,
      shift: "Standby / Maintenance",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80"
    },
    status: "MAINTENANCE",
    statusText: "Maintenance / Depot Bay 3",
    currentStop: "Depot Bay 3",
    nextStop: "Depot Bay 3",
    origin: "South Maintenance Yard",
    destination: "Fleet Workshop",
    eta: "Idle",
    speed: 0,
    speedLimit: 30,
    distanceToNextStop: "0 m",
    timeToNextStop: "--",
    boardingCount: 0,
    occupancy: {
      total: 40,
      available: 40,
      occupied: 0,
      percentage: 0,
      status: "Empty",
      badgeColor: "outline"
    },
    telemetry: {
      gpsAccuracy: "Stationary",
      refreshRate: "10s",
      battery: "100%",
      temperature: "19.5°C",
      lastPing: "30s ago"
    }
  }
];

export const MOCK_ROUTES = [
  {
    id: "R104",
    code: "104 / 42B",
    name: "North Medical Express",
    origin: "Central Station",
    destination: "West Ridge Terminal",
    totalStops: 12,
    distance: "14.2 km",
    duration: "34 min",
    frequency: "Every 10 min",
    firstBus: "05:30 AM",
    lastBus: "11:45 PM",
    fare: "$1.75",
    color: "#8B5CF6",
    activeBuses: 4,
    stops: [
      { id: "S1", name: "Central Station", time: "08:30 AM", distance: "0 km", status: "passed", lat: 37.7749, lng: -122.4194 },
      { id: "S2", name: "Oak Plaza", time: "08:36 AM", distance: "2.1 km", status: "passed", lat: 37.7833, lng: -122.4167 },
      { id: "S3", name: "Willow Creek Stop", time: "08:42 AM", distance: "4.5 km", status: "current", lat: 37.7915, lng: -122.4089 },
      { id: "S4", name: "City Hospital", time: "08:47 AM", distance: "6.8 km", status: "upcoming", lat: 37.7995, lng: -122.4012 },
      { id: "S5", name: "Science & Tech Park", time: "08:52 AM", distance: "8.9 km", status: "upcoming", lat: 37.8080, lng: -122.4110 },
      { id: "S6", name: "North Gateway", time: "08:58 AM", distance: "11.2 km", status: "upcoming", lat: 37.8145, lng: -122.4200 },
      { id: "S7", name: "West Ridge Terminal", time: "09:04 AM", distance: "14.2 km", status: "upcoming", lat: 37.8210, lng: -122.4290 }
    ]
  },
  {
    id: "R12",
    code: "12A",
    name: "Greenfield Loop",
    origin: "Greenfield Heights",
    destination: "Valley Interchange",
    totalStops: 16,
    distance: "18.5 km",
    duration: "42 min",
    frequency: "Every 15 min",
    firstBus: "06:00 AM",
    lastBus: "10:30 PM",
    fare: "$1.50",
    color: "#DDB8FF",
    activeBuses: 3,
    stops: [
      { id: "S10", name: "Greenfield Heights", time: "08:15 AM", distance: "0 km", status: "passed", lat: 37.7550, lng: -122.4350 },
      { id: "S11", name: "Oak Plaza", time: "08:24 AM", distance: "3.2 km", status: "current", lat: 37.7833, lng: -122.4167 },
      { id: "S12", name: "Valley Crossing", time: "08:33 AM", distance: "6.5 km", status: "upcoming", lat: 37.7680, lng: -122.4050 },
      { id: "S13", name: "Meadowlands Mall", time: "08:42 AM", distance: "11.0 km", status: "upcoming", lat: 37.7500, lng: -122.3950 },
      { id: "S14", name: "Valley Interchange", time: "08:57 AM", distance: "18.5 km", status: "upcoming", lat: 37.7420, lng: -122.4100 }
    ]
  },
  {
    id: "R07",
    code: "07",
    name: "Downtown Circular Ring",
    origin: "Central Station",
    destination: "Central Station (Circular)",
    totalStops: 10,
    distance: "9.8 km",
    duration: "25 min",
    frequency: "Every 8 min",
    firstBus: "05:00 AM",
    lastBus: "01:00 AM",
    fare: "$1.25",
    color: "#4EDEA3",
    activeBuses: 5,
    stops: [
      { id: "S20", name: "Central Station", time: "08:40 AM", distance: "0 km", status: "current", lat: 37.7749, lng: -122.4194 },
      { id: "S21", name: "City Hall Plaza", time: "08:45 AM", distance: "1.8 km", status: "upcoming", lat: 37.7795, lng: -122.4180 },
      { id: "S22", name: "Market Square", time: "08:51 AM", distance: "3.5 km", status: "upcoming", lat: 37.7850, lng: -122.4120 },
      { id: "S23", name: "Civic Arts Pavilion", time: "08:58 AM", distance: "6.2 km", status: "upcoming", lat: 37.7820, lng: -122.4050 },
      { id: "S24", name: "River Promenade", time: "09:03 AM", distance: "8.4 km", status: "upcoming", lat: 37.7760, lng: -122.4090 }
    ]
  },
  {
    id: "R18",
    code: "18",
    name: "Valley Link Arterial",
    origin: "Tech Park Gateway",
    destination: "Valley Terminal",
    totalStops: 14,
    distance: "21.0 km",
    duration: "48 min",
    frequency: "Every 20 min",
    firstBus: "06:15 AM",
    lastBus: "11:00 PM",
    fare: "$2.00",
    color: "#F59E0B",
    activeBuses: 3,
    stops: [
      { id: "S30", name: "Tech Park Gateway", time: "08:20 AM", distance: "0 km", status: "passed", lat: 37.8080, lng: -122.4110 },
      { id: "S31", name: "Suburban Junction", time: "08:35 AM", distance: "7.2 km", status: "upcoming", lat: 37.7900, lng: -122.4400 },
      { id: "S32", name: "East District Depot", time: "08:50 AM", distance: "14.5 km", status: "upcoming", lat: 37.7650, lng: -122.4500 },
      { id: "S33", name: "Valley Terminal", time: "09:08 AM", distance: "21.0 km", status: "upcoming", lat: 37.7420, lng: -122.4100 }
    ]
  }
];

export const MOCK_STOPS = [
  {
    id: "ST01",
    name: "Central Station Interchange",
    zone: "Oakridge Downtown Hub",
    distance: "180 m",
    walkTime: "2 min walk",
    lat: 37.7749,
    lng: -122.4194,
    routes: ["42B", "07", "12A", "104"],
    activeBusesCount: 4,
    amenities: ["Shelter", "Digital Display", "LIDAR Sensor", "Wheelchair Ramp"],
    arrivals: [
      { bus: "07", route: "Downtown Circular", eta: "At Station", status: "On Time", load: "45%" },
      { bus: "42B", route: "North Express", eta: "In 3 min", status: "On Time", load: "66%" },
      { bus: "12A", route: "Hillside Shuttle", eta: "In 9 min", status: "Delayed +4m", load: "83%" }
    ]
  },
  {
    id: "ST02",
    name: "Willow Creek Stop",
    zone: "North Corridor",
    distance: "450 m",
    walkTime: "6 min walk",
    lat: 37.7915,
    lng: -122.4089,
    routes: ["42B", "104"],
    activeBusesCount: 2,
    amenities: ["Shelter", "Solar Powered Display", "Bicycle Lockers"],
    arrivals: [
      { bus: "42B", route: "North Express", eta: "In 2 min", status: "Approaching", load: "66%" },
      { bus: "104", route: "City Hospital Run", eta: "In 14 min", status: "On Time", load: "40%" }
    ]
  },
  {
    id: "ST03",
    name: "Oak Plaza Junction",
    zone: "Civic District",
    distance: "750 m",
    walkTime: "9 min walk",
    lat: 37.7833,
    lng: -122.4167,
    routes: ["12A", "42B", "18"],
    activeBusesCount: 3,
    amenities: ["Digital Display", "Ticket Kiosk", "EV Charger"],
    arrivals: [
      { bus: "12A", route: "Hillside Shuttle", eta: "In 5 min", status: "Delayed", load: "83%" },
      { bus: "18", route: "Valley Link", eta: "In 11 min", status: "On Time", load: "66%" }
    ]
  },
  {
    id: "ST04",
    name: "City Hospital & Medical Park",
    zone: "North Gateway",
    distance: "1.2 km",
    walkTime: "15 min walk",
    lat: 37.7995,
    lng: -122.4012,
    routes: ["42B", "104"],
    activeBusesCount: 2,
    amenities: ["Emergency Shelter", "Priority Wheelchair Bay", "24/7 Transit Phone"],
    arrivals: [
      { bus: "42B", route: "North Express", eta: "In 8 min", status: "On Time", load: "66%" }
    ]
  }
];

// Seat map layout for Volvo Electric 42-seat CityBus
export const generateSeatsData = () => {
  const seats = [];
  
  // Row 1: Priority Accessible (4 seats: 01, 02 left, 03, 04 right)
  seats.push(
    { id: "01", number: "01", row: 1, side: "left", position: "window", isPriority: true, isOccupied: false },
    { id: "02", number: "02", row: 1, side: "left", position: "aisle", isPriority: true, isOccupied: true },
    { id: "03", number: "03", row: 1, side: "right", position: "aisle", isPriority: true, isOccupied: false },
    { id: "04", number: "04", row: 1, side: "right", position: "window", isPriority: true, isOccupied: true }
  );

  // Rows 2 to 9: Standard 2x2 seats (32 seats: 05 to 36)
  let seatNum = 5;
  for (let r = 2; r <= 9; r++) {
    // 2 on left, 2 on right
    // Specific occupancy distribution to match 14 available / 28 occupied
    const occupiedLeftWindow = [2, 3, 5, 7, 8].includes(r);
    const occupiedLeftAisle = [2, 4, 6, 8, 9].includes(r);
    const occupiedRightAisle = [3, 4, 5, 7, 9].includes(r);
    const occupiedRightWindow = [2, 5, 6, 7, 8].includes(r);

    seats.push(
      { id: String(seatNum).padStart(2, '0'), number: String(seatNum++).padStart(2, '0'), row: r, side: "left", position: "window", isPriority: false, isOccupied: occupiedLeftWindow },
      { id: String(seatNum).padStart(2, '0'), number: String(seatNum++).padStart(2, '0'), row: r, side: "left", position: "aisle", isPriority: false, isOccupied: occupiedLeftAisle },
      { id: String(seatNum).padStart(2, '0'), number: String(seatNum++).padStart(2, '0'), row: r, side: "right", position: "aisle", isPriority: false, isOccupied: occupiedRightAisle },
      { id: String(seatNum).padStart(2, '0'), number: String(seatNum++).padStart(2, '0'), row: r, side: "right", position: "window", isPriority: false, isOccupied: occupiedRightWindow }
    );
  }

  // Row 10: Rear 6-bench (37 to 42)
  seats.push(
    { id: "37", number: "37", row: 10, side: "rear", position: "window", isPriority: false, isOccupied: true },
    { id: "38", number: "38", row: 10, side: "rear", position: "middle", isPriority: false, isOccupied: false },
    { id: "39", number: "39", row: 10, side: "rear", position: "middle", isPriority: false, isOccupied: true },
    { id: "40", number: "40", row: 10, side: "rear", position: "middle", isPriority: false, isOccupied: false },
    { id: "41", number: "41", row: 10, side: "rear", position: "middle", isPriority: false, isOccupied: true },
    { id: "42", number: "42", row: 10, side: "rear", position: "window", isPriority: false, isOccupied: true }
  );

  return seats;
};

export const MOCK_DRIVERS = [
  {
    id: "DRV-8492",
    name: "Marcus Vance",
    busId: "42B",
    route: "North Medical Express (Line 42)",
    status: "ON_DUTY",
    shiftTime: "06:00 - 14:30",
    experience: "6 yrs",
    phone: "+1 (555) 234-8492",
    rating: 4.9,
    tripsToday: 4,
    speedAvg: "36 km/h",
    safetyScore: "99.2%"
  },
  {
    id: "DRV-6218",
    name: "Sarah Chen",
    busId: "12A",
    route: "Greenfield Loop (Line 12)",
    status: "ON_DUTY",
    shiftTime: "07:30 - 16:00",
    experience: "4 yrs",
    phone: "+1 (555) 492-6218",
    rating: 4.8,
    tripsToday: 3,
    speedAvg: "28 km/h",
    safetyScore: "98.5%"
  },
  {
    id: "DRV-3041",
    name: "David Kim",
    busId: "07",
    route: "Downtown Circular (Line 07)",
    status: "ON_DUTY",
    shiftTime: "08:00 - 16:30",
    experience: "8 yrs",
    phone: "+1 (555) 881-3041",
    rating: 4.95,
    tripsToday: 6,
    speedAvg: "24 km/h",
    safetyScore: "99.8%"
  },
  {
    id: "DRV-9014",
    name: "Elena Gomez",
    busId: "18",
    route: "Valley Link (Line 18)",
    status: "ON_DUTY",
    shiftTime: "06:30 - 15:00",
    experience: "5 yrs",
    phone: "+1 (555) 302-9014",
    rating: 4.75,
    tripsToday: 3,
    speedAvg: "38 km/h",
    safetyScore: "97.9%"
  },
  {
    id: "DRV-7712",
    name: "Jason Brooks",
    busId: "15",
    route: "River Rapid (Line 15)",
    status: "ON_DUTY",
    shiftTime: "09:00 - 17:30",
    experience: "3 yrs",
    phone: "+1 (555) 714-7712",
    rating: 4.88,
    tripsToday: 2,
    speedAvg: "34 km/h",
    safetyScore: "98.9%"
  },
  {
    id: "DRV-1182",
    name: "Robert Miller",
    busId: "04",
    route: "South Depot Standby",
    status: "STANDBY",
    shiftTime: "10:00 - 18:30",
    experience: "11 yrs",
    phone: "+1 (555) 902-1182",
    rating: 4.6,
    tripsToday: 0,
    speedAvg: "0 km/h",
    safetyScore: "99.0%"
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    id: "NOTIF-01",
    title: "Route 15 River Road Detour Active",
    type: "ADVISORY",
    category: "Detour",
    time: "10 mins ago",
    unread: true,
    message: "River Road resurfacing active until 16:00. Bus 15 skipping Oak Quay stop. Commuters are advised to use Central Pier."
  },
  {
    id: "NOTIF-02",
    title: "System Delay: Heavy Weather Protocol",
    type: "WEATHER",
    category: "Operations",
    time: "45 mins ago",
    unread: true,
    message: "Moderate rain advisory in West Ridge district. Driver speed caps set to 40 km/h for civic commuter safety."
  },
  {
    id: "NOTIF-03",
    title: "New Electric Bus 42B Deployed",
    type: "INFO",
    category: "Fleet Update",
    time: "2 hours ago",
    unread: false,
    message: "Volvo 12m zero-emission electric bus added to Line 42 with real-time LIDAR seat occupancy monitoring."
  },
  {
    id: "NOTIF-04",
    title: "Weekend Schedule Adjustments",
    type: "SCHEDULE",
    category: "Notice",
    time: "Yesterday",
    unread: false,
    message: "Sunday express corridors will operate on an optimized 15-minute headway. Check updated route schedules."
  }
];

export const MOCK_FEEDBACK = [
  {
    id: "FB-8942",
    busId: "12A",
    route: "Greenfield Loop",
    passenger: "Alex Morgan",
    rating: 4,
    category: "AC / Climate",
    subject: "AC temperature on Bus 12A",
    comment: "Climate control was set slightly too low near 4th row, but driver was very courteous and on time!",
    status: "UNDER_REVIEW",
    time: "24 mins ago",
    severity: "low"
  },
  {
    id: "FB-8941",
    busId: "42B",
    route: "North Express",
    passenger: "Emily Thorne",
    rating: 5,
    category: "Service Excellence",
    subject: "Smooth electric commute",
    comment: "The new electric bus is whisper quiet and the live seat availability helped me find an open seat right away!",
    status: "RESOLVED",
    time: "1 hour ago",
    severity: "nominal"
  },
  {
    id: "FB-8939",
    busId: "18",
    route: "Valley Link",
    passenger: "Jordan Vance",
    rating: 2,
    category: "Punctuality",
    subject: "Suburban Junction bottleneck",
    comment: "Bus was held at Suburban Junction for 8 minutes due to lane construction. Need real-time detour routing.",
    status: "OPEN",
    time: "3 hours ago",
    severity: "medium"
  }
];

export const MOCK_TRIPS_HISTORY = [
  {
    id: "TRIP-9201",
    busId: "42B",
    route: "North Medical Express",
    driver: "Marcus Vance",
    departureTime: "07:15 AM",
    arrivalTime: "07:49 AM",
    duration: "34 min",
    passengers: 58,
    status: "Completed (On Time)",
    efficiency: "98.2%"
  },
  {
    id: "TRIP-9200",
    busId: "07",
    route: "Downtown Circular",
    driver: "David Kim",
    departureTime: "07:30 AM",
    arrivalTime: "07:55 AM",
    duration: "25 min",
    passengers: 42,
    status: "Completed (On Time)",
    efficiency: "99.0%"
  },
  {
    id: "TRIP-9199",
    busId: "12A",
    route: "Greenfield Loop",
    driver: "Sarah Chen",
    departureTime: "07:00 AM",
    arrivalTime: "07:46 AM",
    duration: "46 min",
    passengers: 64,
    status: "Completed (+4m Delay)",
    efficiency: "91.5%"
  },
  {
    id: "TRIP-9198",
    busId: "18",
    route: "Valley Link",
    driver: "Elena Gomez",
    departureTime: "06:45 AM",
    arrivalTime: "07:35 AM",
    duration: "50 min",
    passengers: 71,
    status: "Completed (+5m Delay)",
    efficiency: "89.8%"
  }
];

export const MOCK_REPORTS = {
  ridershipWeekly: [
    { day: "Mon", count: 13900 },
    { day: "Tue", count: 14200 },
    { day: "Wed", count: 14650 },
    { day: "Thu", count: 15100 },
    { day: "Fri", count: 14820 },
    { day: "Sat", count: 11400 },
    { day: "Sun", count: 9800 }
  ],
  onTimeTrend: [
    { time: "06:00", rate: 96.5 },
    { time: "08:00", rate: 92.1 },
    { time: "10:00", rate: 95.0 },
    { time: "12:00", rate: 94.8 },
    { time: "14:00", rate: 93.8 },
    { time: "16:00", rate: 90.4 },
    { time: "18:00", rate: 89.2 },
    { time: "20:00", rate: 96.0 }
  ],
  co2OffsetKg: 3420,
  electricFleetShare: "68%",
  avgHeadwayMin: 11.4
};
