export interface IpGeoLocation {
  ip: string;
  hostname: string | null;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isp: string;
  org: string | null;
  asNumber: string | null;
  mobile: boolean;
  proxy: boolean;
  hosting: boolean;
}
