import type { Car } from "./car-data"
import danawaCarsJson from "./danawa-default-cars.json"

const danawaCars = danawaCarsJson as Car[]
export const defaultCars: Car[] = danawaCars
