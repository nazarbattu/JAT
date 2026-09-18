import { City, Country, State } from "country-state-city"

export type LocationSuggestion = {
  id: string
  city: string
  state: string
  country: string
  label: string
}

type LocationIndexEntry = LocationSuggestion & {
  cityLower: string
}

let indexPromise: Promise<LocationIndexEntry[]> | null = null

function buildIndex(): LocationIndexEntry[] {
  const countryNames = new Map(
    Country.getAllCountries().map((country) => [country.isoCode, country.name]),
  )
  const stateNames = new Map(
    State.getAllStates().map((state) => [
      `${state.countryCode}:${state.isoCode}`,
      state.name,
    ]),
  )

  return City.getAllCities().map((city) => {
    const country = countryNames.get(city.countryCode) ?? city.countryCode
    const state =
      stateNames.get(`${city.countryCode}:${city.stateCode}`) ?? city.stateCode
    const label = `${city.name}, ${state}, ${country}`

    return {
      id: `${city.countryCode}:${city.stateCode}:${city.name}`,
      city: city.name,
      state,
      country,
      label,
      cityLower: city.name.toLowerCase(),
    }
  })
}

function getIndex(): Promise<LocationIndexEntry[]> {
  if (!indexPromise) {
    indexPromise = Promise.resolve().then(buildIndex)
  }
  return indexPromise
}

/** Warm the city index in the background (optional). */
export function preloadLocationIndex() {
  void getIndex()
}

/**
 * Search cities worldwide by name. Matches any country/state.
 * Prefers prefix matches, then substring matches.
 */
export async function searchLocations(
  query: string,
  limit = 12,
): Promise<LocationSuggestion[]> {
  const normalized = query.trim().toLowerCase()
  if (normalized.length < 2) return []

  const index = await getIndex()
  const prefix: LocationSuggestion[] = []
  const contains: LocationSuggestion[] = []

  for (const entry of index) {
    if (entry.cityLower.startsWith(normalized)) {
      prefix.push(entry)
      if (prefix.length >= limit) break
      continue
    }

    if (
      contains.length + prefix.length < limit * 3 &&
      entry.cityLower.includes(normalized)
    ) {
      contains.push(entry)
    }
  }

  return [...prefix, ...contains].slice(0, limit).map(
    ({ id, city, state, country, label }) => ({
      id,
      city,
      state,
      country,
      label,
    }),
  )
}
