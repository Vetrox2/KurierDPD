import { LatLng } from 'leaflet';

export interface RouteDto {
  id: number;
  points: {
    lat: number;
    lng: number;
    address?: string;
    additionalInfo?: string;
  }[];
}

export interface Route {
  id: number;
  points: RoutePoint[];
}

export interface RoutePoint {
  point: LatLng;
  address?: string;
  additionalInfo?: string;
  markedAsVisited?: boolean;
}
