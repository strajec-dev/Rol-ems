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
    image: '/events/cottage.jpg',
  },
  {
    establishment: 'ROL-EMS Resort',
    category: 'Play',
    title: 'Pickleball',
    detail: 'Pickleball court · open play queue active',
    price: '₱350 / hour',
    status: 'Live queue active',
    image: '/events/pickleball.jpg',
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
    image: '/events/teakwondo.jpg',
  },
]

export type CottageType = {
  name: string
  detail: string
  price: string
  image: string
}

export const cottageOptions: CottageType[] = [
  { name: 'Beach Cottage', detail: 'Beachside cottage rental · kubo style', price: '₱2,500 / day', image: '/events/cottage.jpg' },
]

export const eventVenues: CottageType[] = [
  { name: 'Whole-Area Venue', detail: 'Whole resort / event area', price: 'Event fee on request', image: '/events/cottage.jpg' },
]

export const facilityFilters = ['All', 'ROL-EMS Resort', 'Rebar Sports Center'] as const

export const queues: Record<string, string[]> = {
  Pickleball: ['Court 02', 'M. Santos / J. Rivera', '11 — 8', '12 min'],
  Badminton: ['Court 01', 'A. Cruz / P. Lim', '19 — 17', '8 min'],
  'Ping-Pong': ['Table 01', 'K. Dela Cruz / R. Tan', '7 — 5', '5 min'],
}

export const queueOrder = Object.keys(queues)
