export interface MetalCity {
  name: string
  slug: string
  state: string
  goodreturnsSlug: string
}

export const METAL_CITIES: MetalCity[] = [
  { name: 'Agra',               slug: 'agra',               state: 'Uttar Pradesh',    goodreturnsSlug: 'agra' },
  { name: 'Ahmedabad',          slug: 'ahmedabad',          state: 'Gujarat',           goodreturnsSlug: 'ahmedabad' },
  { name: 'Amritsar',           slug: 'amritsar',           state: 'Punjab',            goodreturnsSlug: 'amritsar' },
  { name: 'Aurangabad',         slug: 'aurangabad',         state: 'Maharashtra',       goodreturnsSlug: 'aurangabad' },
  { name: 'Bengaluru',          slug: 'bengaluru',          state: 'Karnataka',         goodreturnsSlug: 'bangalore' },
  { name: 'Bhopal',             slug: 'bhopal',             state: 'Madhya Pradesh',    goodreturnsSlug: 'bhopal' },
  { name: 'Bhubaneswar',        slug: 'bhubaneswar',        state: 'Odisha',            goodreturnsSlug: 'bhubaneswar' },
  { name: 'Chandigarh',         slug: 'chandigarh',         state: 'Chandigarh',        goodreturnsSlug: 'chandigarh' },
  { name: 'Chennai',            slug: 'chennai',            state: 'Tamil Nadu',        goodreturnsSlug: 'chennai' },
  { name: 'Coimbatore',         slug: 'coimbatore',         state: 'Tamil Nadu',        goodreturnsSlug: 'coimbatore' },
  { name: 'Delhi',              slug: 'delhi',              state: 'Delhi',             goodreturnsSlug: 'delhi' },
  { name: 'Guwahati',           slug: 'guwahati',           state: 'Assam',             goodreturnsSlug: 'guwahati' },
  { name: 'Hyderabad',          slug: 'hyderabad',          state: 'Telangana',         goodreturnsSlug: 'hyderabad' },
  { name: 'Indore',             slug: 'indore',             state: 'Madhya Pradesh',    goodreturnsSlug: 'indore' },
  { name: 'Jaipur',             slug: 'jaipur',             state: 'Rajasthan',         goodreturnsSlug: 'jaipur' },
  { name: 'Kanpur',             slug: 'kanpur',             state: 'Uttar Pradesh',     goodreturnsSlug: 'kanpur' },
  { name: 'Kochi',              slug: 'kochi',              state: 'Kerala',            goodreturnsSlug: 'kochi' },
  { name: 'Kolkata',            slug: 'kolkata',            state: 'West Bengal',       goodreturnsSlug: 'kolkata' },
  { name: 'Kozhikode',          slug: 'kozhikode',          state: 'Kerala',            goodreturnsSlug: 'kozhikode' },
  { name: 'Lucknow',            slug: 'lucknow',            state: 'Uttar Pradesh',     goodreturnsSlug: 'lucknow' },
  { name: 'Ludhiana',           slug: 'ludhiana',           state: 'Punjab',            goodreturnsSlug: 'ludhiana' },
  { name: 'Madurai',            slug: 'madurai',            state: 'Tamil Nadu',        goodreturnsSlug: 'madurai' },
  { name: 'Mumbai',             slug: 'mumbai',             state: 'Maharashtra',       goodreturnsSlug: 'mumbai' },
  { name: 'Mysuru',             slug: 'mysuru',             state: 'Karnataka',         goodreturnsSlug: 'mysore' },
  { name: 'Nagpur',             slug: 'nagpur',             state: 'Maharashtra',       goodreturnsSlug: 'nagpur' },
  { name: 'Nashik',             slug: 'nashik',             state: 'Maharashtra',       goodreturnsSlug: 'nashik' },
  { name: 'Patna',              slug: 'patna',              state: 'Bihar',             goodreturnsSlug: 'patna' },
  { name: 'Pune',               slug: 'pune',               state: 'Maharashtra',       goodreturnsSlug: 'pune' },
  { name: 'Raipur',             slug: 'raipur',             state: 'Chhattisgarh',      goodreturnsSlug: 'raipur' },
  { name: 'Rajkot',             slug: 'rajkot',             state: 'Gujarat',           goodreturnsSlug: 'rajkot' },
  { name: 'Surat',              slug: 'surat',              state: 'Gujarat',           goodreturnsSlug: 'surat' },
  { name: 'Thiruvananthapuram', slug: 'thiruvananthapuram', state: 'Kerala',            goodreturnsSlug: 'trivandrum' },
  { name: 'Tiruchirappalli',    slug: 'tiruchirappalli',    state: 'Tamil Nadu',        goodreturnsSlug: 'trichy' },
  { name: 'Vadodara',           slug: 'vadodara',           state: 'Gujarat',           goodreturnsSlug: 'vadodara' },
  { name: 'Varanasi',           slug: 'varanasi',           state: 'Uttar Pradesh',     goodreturnsSlug: 'varanasi' },
  { name: 'Vijayawada',         slug: 'vijayawada',         state: 'Andhra Pradesh',    goodreturnsSlug: 'vijayawada' },
  { name: 'Visakhapatnam',      slug: 'visakhapatnam',      state: 'Andhra Pradesh',    goodreturnsSlug: 'visakhapatnam' },
]

export function getMetalCityBySlug(slug: string): MetalCity | undefined {
  return METAL_CITIES.find(c => c.slug === slug)
}
