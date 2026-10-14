import { rwandaDistricts } from "../lib/catalog";

export default function DistrictOptions() {
  return Object.entries(rwandaDistricts).map(([province, districts]) => <optgroup label={province} key={province}>{districts.map(district => <option value={district} key={district}>{district}</option>)}</optgroup>);
}
