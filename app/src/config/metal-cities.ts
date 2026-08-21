export interface MetalCity {
  name: string
  slug: string
  state: string
  goodreturnsSlug: string
}

export const METAL_CITIES: MetalCity[] = [
  { name: 'Delhi',     slug: 'delhi',     state: 'Delhi',          goodreturnsSlug: 'delhi' },
  { name: 'Mumbai',    slug: 'mumbai',    state: 'Maharashtra',    goodreturnsSlug: 'mumbai' },
  { name: 'Bangalore', slug: 'bengaluru', state: 'Karnataka',      goodreturnsSlug: 'bangalore' },
  { name: 'Chennai',   slug: 'chennai',   state: 'Tamil Nadu',     goodreturnsSlug: 'chennai' },
  { name: 'Hyderabad', slug: 'hyderabad', state: 'Telangana',      goodreturnsSlug: 'hyderabad' },
  { name: 'Kolkata',   slug: 'kolkata',   state: 'West Bengal',    goodreturnsSlug: 'kolkata' },
  { name: 'Ahmedabad', slug: 'ahmedabad', state: 'Gujarat',        goodreturnsSlug: 'ahmedabad' },
  { name: 'Pune',      slug: 'pune',      state: 'Maharashtra',    goodreturnsSlug: 'pune' },
  { name: 'Jaipur',    slug: 'jaipur',    state: 'Rajasthan',      goodreturnsSlug: 'jaipur' },
  { name: 'Lucknow',   slug: 'lucknow',   state: 'Uttar Pradesh',  goodreturnsSlug: 'lucknow' },
]

export function getMetalCityBySlug(slug: string): MetalCity | undefined {
  return METAL_CITIES.find(c => c.slug === slug)
}
