export type Facility = {
  establishment: 'ROL-EMS Resort' | 'Rebar Sports Center'
  category: string
  title: string
  detail: string
  price: string
  status: string
  image: string
}

const resortMark = (image: string) => `https://images.unsplash.com/${image}?auto=format&fit=crop&w=1200&q=85`

export const facilities: Facility[] = [
  {
    establishment: 'ROL-EMS Resort',
    category: 'Stay',
    title: 'Cottage & Event',
    detail: 'Private cottage stay · whole-area and event reservations',
    price: '₱2,500 / day',
    status: 'Available now',
    image: '/sports-events/cottage.jpg',
  },
  {
    establishment: 'ROL-EMS Resort',
    category: 'Play',
    title: 'Pickleball',
    detail: 'Pickleball court · open play queue active',
    price: '₱350 / hour',
    status: 'Live queue active',
    image: '/sports-events/pickleball.jpg',
  },
  {
    establishment: 'Rebar Sports Center',
    category: 'Play',
    title: 'Badminton',
    detail: 'Air-conditioned badminton court · equipment available',
    price: '₱300 / hour',
    status: 'Available now',
    image: resortMark('photo-1626224583764-f87db24ac4ea'),
  },
  {
    establishment: 'Rebar Sports Center',
    category: 'Play',
    title: 'Taekwondo',
    detail: 'Training floor for taekwondo sessions',
    price: '₱250 / hour',
    status: 'Available now',
    image: '/sports-events/teakwondo.jpg',
  },
]

export type CottageType = {
  name: string
  detail: string
  price: string
  image: string
  capacity?: number
}

export const cottageOptions: CottageType[] = [
  { name: 'Kubo Cottage', detail: 'Beachside nipa-hut cottage', price: '₱1,800 / day', image: '/sports-events/cottage.jpg', capacity: 6 },
  { name: 'Beach Cottage', detail: 'Beachside cottage rental · kubo style', price: '₱2,500 / day', image: '/sports-events/cottage.jpg', capacity: 8 },
  { name: 'Family Cottage', detail: 'Larger cottage for families & groups', price: '₱3,500 / day', image: '/sports-events/cottage.jpg', capacity: 12 },
]

export const eventVenues: CottageType[] = [
  { name: 'Half-Area Venue', detail: 'Half of the resort for smaller events', price: '₱12,000 / day', image: '/sports-events/cottage.jpg', capacity: 50 },
  { name: 'Whole-Area Venue', detail: 'Whole resort / event area', price: '₱20,000 / day', image: '/sports-events/cottage.jpg', capacity: 150 },
]

export type EventAddOn = {
  id: string
  name: string
  detail: string
  price: number
  unit: string
}

export const eventAddOns: EventAddOn[] = [
  { id: 'chairs', name: 'Folding chairs', detail: 'Stackable chairs for guests', price: 50, unit: 'each / day' },
  { id: 'tables', name: 'Long tables', detail: '8-ft banquet tables', price: 300, unit: 'each / day' },
  { id: 'deck-chairs', name: 'Deck chairs', detail: 'Lounge deck chairs', price: 120, unit: 'each / day' },
  { id: 'canopy', name: 'Canopy / tent', detail: 'Shade canopy for outdoor setups', price: 1500, unit: 'each / day' },
  { id: 'sound', name: 'Sound system', detail: 'Speakers + mic setup', price: 2500, unit: 'per event' },
  { id: 'gen-set', name: 'Generator', detail: 'Backup power generator', price: 2000, unit: 'per event' },
  { id: 'catering', name: 'Catering service', detail: 'Full package, quote on request', price: 0, unit: 'quote' },
]

export const cottageAddOns: EventAddOn[] = [
  { id: 'extra-bedding', name: 'Extra bedding', detail: 'Extra mattress + linens per guest', price: 100, unit: 'each / night' },
  { id: 'griller', name: 'Charcoal griller', detail: 'Barbecue set with charcoal', price: 300, unit: 'per stay' },
  { id: 'karaoke', name: 'Karaoke machine', detail: 'Videoke with speakers + mics', price: 500, unit: 'per stay' },
  { id: 'beach-tables', name: 'Table & chairs', detail: 'Outdoor table + 4 chairs', price: 250, unit: 'per stay' },
  { id: 'pocket-wifi', name: 'Pocket Wi-Fi', detail: 'Portable hotspot for the stay', price: 200, unit: 'per stay' },
]

export const pickleballOptions: CottageType[] = [
  { name: 'Court 01', detail: 'Standard pickleball court', price: '₱350 / hour', image: '/sports-events/pickleball.jpg' },
  { name: 'Court 02', detail: 'Standard pickleball court', price: '₱350 / hour', image: '/sports-events/pickleball.jpg' },
]

export const badmintonOptions: CottageType[] = [
  { name: 'Court 01', detail: 'Air-conditioned badminton court', price: '₱300 / hour', image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=85' },
  { name: 'Court 02', detail: 'Air-conditioned badminton court', price: '₱300 / hour', image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=85' },
]

export const taekwondoOptions: CottageType[] = [
  { name: 'Training Floor 01', detail: 'Taekwondo training floor', price: '₱250 / hour', image: '/sports-events/teakwondo.jpg' },
  { name: 'Training Floor 02', detail: 'Taekwondo training floor', price: '₱250 / hour', image: '/sports-events/teakwondo.jpg' },
]

// Real-time availability (simulated). Keys are ISO dates; values are start times
// (e.g. '10:00 AM') already booked on that court that day.
export const pickleballAvailability: Record<string, string[]> = {
  '2026-08-27': ['11:00 AM', '3:00 PM'],
  '2026-08-28': ['9:00 AM', '1:00 PM', '6:00 PM'],
}

export const facilityFilters = ['All', 'ROL-EMS Resort', 'Rebar Sports Center'] as const

export const queues: Record<string, string[]> = {
  Pickleball: ['Court 02', 'M. Santos / J. Rivera', '11 — 8', '12 min'],
  Badminton: ['Court 01', 'A. Cruz / P. Lim', '19 — 17', '8 min'],
  'Ping-Pong': ['Table 01', 'K. Dela Cruz / R. Tan', '7 — 5', '5 min'],
}

export const queueOrder = Object.keys(queues)
