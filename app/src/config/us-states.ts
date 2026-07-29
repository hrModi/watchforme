// EIA duoarea codes for US states: "S" + state abbreviation
// National average uses "NUS"
export interface USState {
  name: string
  slug: string
  abbr: string
  eiaCode: string // EIA duoarea code: S + state_abbr
}

export const US_STATES: USState[] = [
  { name: 'Alabama', slug: 'alabama', abbr: 'AL', eiaCode: 'SAL' },
  { name: 'Alaska', slug: 'alaska', abbr: 'AK', eiaCode: 'SAK' },
  { name: 'Arizona', slug: 'arizona', abbr: 'AZ', eiaCode: 'SAZ' },
  { name: 'Arkansas', slug: 'arkansas', abbr: 'AR', eiaCode: 'SAR' },
  { name: 'California', slug: 'california', abbr: 'CA', eiaCode: 'SCA' },
  { name: 'Colorado', slug: 'colorado', abbr: 'CO', eiaCode: 'SCO' },
  { name: 'Connecticut', slug: 'connecticut', abbr: 'CT', eiaCode: 'SCT' },
  { name: 'Delaware', slug: 'delaware', abbr: 'DE', eiaCode: 'SDE' },
  { name: 'Florida', slug: 'florida', abbr: 'FL', eiaCode: 'SFL' },
  { name: 'Georgia', slug: 'georgia', abbr: 'GA', eiaCode: 'SGA' },
  { name: 'Hawaii', slug: 'hawaii', abbr: 'HI', eiaCode: 'SHI' },
  { name: 'Idaho', slug: 'idaho', abbr: 'ID', eiaCode: 'SID' },
  { name: 'Illinois', slug: 'illinois', abbr: 'IL', eiaCode: 'SIL' },
  { name: 'Indiana', slug: 'indiana', abbr: 'IN', eiaCode: 'SIN' },
  { name: 'Iowa', slug: 'iowa', abbr: 'IA', eiaCode: 'SIA' },
  { name: 'Kansas', slug: 'kansas', abbr: 'KS', eiaCode: 'SKS' },
  { name: 'Kentucky', slug: 'kentucky', abbr: 'KY', eiaCode: 'SKY' },
  { name: 'Louisiana', slug: 'louisiana', abbr: 'LA', eiaCode: 'SLA' },
  { name: 'Maine', slug: 'maine', abbr: 'ME', eiaCode: 'SME' },
  { name: 'Maryland', slug: 'maryland', abbr: 'MD', eiaCode: 'SMD' },
  { name: 'Massachusetts', slug: 'massachusetts', abbr: 'MA', eiaCode: 'SMA' },
  { name: 'Michigan', slug: 'michigan', abbr: 'MI', eiaCode: 'SMI' },
  { name: 'Minnesota', slug: 'minnesota', abbr: 'MN', eiaCode: 'SMN' },
  { name: 'Mississippi', slug: 'mississippi', abbr: 'MS', eiaCode: 'SMS' },
  { name: 'Missouri', slug: 'missouri', abbr: 'MO', eiaCode: 'SMO' },
  { name: 'Montana', slug: 'montana', abbr: 'MT', eiaCode: 'SMT' },
  { name: 'Nebraska', slug: 'nebraska', abbr: 'NE', eiaCode: 'SNE' },
  { name: 'Nevada', slug: 'nevada', abbr: 'NV', eiaCode: 'SNV' },
  { name: 'New Hampshire', slug: 'new-hampshire', abbr: 'NH', eiaCode: 'SNH' },
  { name: 'New Jersey', slug: 'new-jersey', abbr: 'NJ', eiaCode: 'SNJ' },
  { name: 'New Mexico', slug: 'new-mexico', abbr: 'NM', eiaCode: 'SNM' },
  { name: 'New York', slug: 'new-york', abbr: 'NY', eiaCode: 'SNY' },
  { name: 'North Carolina', slug: 'north-carolina', abbr: 'NC', eiaCode: 'SNC' },
  { name: 'North Dakota', slug: 'north-dakota', abbr: 'ND', eiaCode: 'SND' },
  { name: 'Ohio', slug: 'ohio', abbr: 'OH', eiaCode: 'SOH' },
  { name: 'Oklahoma', slug: 'oklahoma', abbr: 'OK', eiaCode: 'SOK' },
  { name: 'Oregon', slug: 'oregon', abbr: 'OR', eiaCode: 'SOR' },
  { name: 'Pennsylvania', slug: 'pennsylvania', abbr: 'PA', eiaCode: 'SPA' },
  { name: 'Rhode Island', slug: 'rhode-island', abbr: 'RI', eiaCode: 'SRI' },
  { name: 'South Carolina', slug: 'south-carolina', abbr: 'SC', eiaCode: 'SSC' },
  { name: 'South Dakota', slug: 'south-dakota', abbr: 'SD', eiaCode: 'SSD' },
  { name: 'Tennessee', slug: 'tennessee', abbr: 'TN', eiaCode: 'STN' },
  { name: 'Texas', slug: 'texas', abbr: 'TX', eiaCode: 'STX' },
  { name: 'Utah', slug: 'utah', abbr: 'UT', eiaCode: 'SUT' },
  { name: 'Vermont', slug: 'vermont', abbr: 'VT', eiaCode: 'SVT' },
  { name: 'Virginia', slug: 'virginia', abbr: 'VA', eiaCode: 'SVA' },
  { name: 'Washington', slug: 'washington', abbr: 'WA', eiaCode: 'SWA' },
  { name: 'West Virginia', slug: 'west-virginia', abbr: 'WV', eiaCode: 'SWV' },
  { name: 'Wisconsin', slug: 'wisconsin', abbr: 'WI', eiaCode: 'SWI' },
  { name: 'Wyoming', slug: 'wyoming', abbr: 'WY', eiaCode: 'SWY' },
]

export const EIA_NATIONAL_CODE = 'NUS'

export function getStateBySlug(slug: string): USState | undefined {
  return US_STATES.find(s => s.slug === slug)
}

export function getStateByEiaCode(code: string): USState | undefined {
  return US_STATES.find(s => s.eiaCode === code)
}
