export interface IndiaCity {
  name: string
  slug: string
  state: string
  sourceSlug?: string  // override slug used in petrolpriceindia.com URLs
}

export const INDIA_CITIES: IndiaCity[] = [
  { name: 'Agra', slug: 'agra', state: 'Uttar Pradesh' },
  { name: 'Ahmedabad', slug: 'ahmedabad', state: 'Gujarat' },
  { name: 'Amritsar', slug: 'amritsar', state: 'Punjab' },
  { name: 'Aurangabad', slug: 'aurangabad', state: 'Maharashtra' },
  { name: 'Bengaluru', slug: 'bengaluru', state: 'Karnataka' },
  { name: 'Bhopal', slug: 'bhopal', state: 'Madhya Pradesh' },
  { name: 'Bhubaneswar', slug: 'bhubaneswar', state: 'Odisha', sourceSlug: 'skip' },
  { name: 'Chandigarh', slug: 'chandigarh', state: 'Chandigarh' },
  { name: 'Chennai', slug: 'chennai', state: 'Tamil Nadu' },
  { name: 'Coimbatore', slug: 'coimbatore', state: 'Tamil Nadu' },
  { name: 'Dehradun', slug: 'dehradun', state: 'Uttarakhand' },
  { name: 'Delhi', slug: 'delhi', state: 'Delhi' },
  { name: 'Guwahati', slug: 'guwahati', state: 'Assam' },
  { name: 'Gwalior', slug: 'gwalior', state: 'Madhya Pradesh' },
  { name: 'Hyderabad', slug: 'hyderabad', state: 'Telangana' },
  { name: 'Indore', slug: 'indore', state: 'Madhya Pradesh' },
  { name: 'Jaipur', slug: 'jaipur', state: 'Rajasthan' },
  { name: 'Jalandhar', slug: 'jalandhar', state: 'Punjab' },
  { name: 'Jodhpur', slug: 'jodhpur', state: 'Rajasthan' },
  { name: 'Kanpur', slug: 'kanpur', state: 'Uttar Pradesh' },
  { name: 'Kochi', slug: 'kochi', state: 'Kerala', sourceSlug: 'skip' },
  { name: 'Kolkata', slug: 'kolkata', state: 'West Bengal' },
  { name: 'Kozhikode', slug: 'kozhikode', state: 'Kerala' },
  { name: 'Lucknow', slug: 'lucknow', state: 'Uttar Pradesh' },
  { name: 'Ludhiana', slug: 'ludhiana', state: 'Punjab' },
  { name: 'Madurai', slug: 'madurai', state: 'Tamil Nadu' },
  { name: 'Mumbai', slug: 'mumbai', state: 'Maharashtra' },
  { name: 'Mysuru', slug: 'mysuru', state: 'Karnataka', sourceSlug: 'mysore' },
  { name: 'Nagpur', slug: 'nagpur', state: 'Maharashtra' },
  { name: 'Nashik', slug: 'nashik', state: 'Maharashtra' },
  { name: 'Patna', slug: 'patna', state: 'Bihar' },
  { name: 'Pune', slug: 'pune', state: 'Maharashtra' },
  { name: 'Raipur', slug: 'raipur', state: 'Chhattisgarh' },
  { name: 'Rajkot', slug: 'rajkot', state: 'Gujarat' },
  { name: 'Ranchi', slug: 'ranchi', state: 'Jharkhand' },
  { name: 'Srinagar', slug: 'srinagar', state: 'Jammu & Kashmir' },
  { name: 'Surat', slug: 'surat', state: 'Gujarat' },
  { name: 'Thiruvananthapuram', slug: 'thiruvananthapuram', state: 'Kerala', sourceSlug: 'skip' },
  { name: 'Tiruchirappalli', slug: 'tiruchirappalli', state: 'Tamil Nadu' },
  { name: 'Vadodara', slug: 'vadodara', state: 'Gujarat' },
  { name: 'Varanasi', slug: 'varanasi', state: 'Uttar Pradesh' },
  { name: 'Vijayawada', slug: 'vijayawada', state: 'Andhra Pradesh' },
  { name: 'Visakhapatnam', slug: 'visakhapatnam', state: 'Andhra Pradesh', sourceSlug: 'skip' },
]

export function getCityBySlug(slug: string): IndiaCity | undefined {
  return INDIA_CITIES.find(c => c.slug === slug)
}
