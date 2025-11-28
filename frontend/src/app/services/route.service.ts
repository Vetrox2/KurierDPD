import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { latLng } from 'leaflet';
import { Route, RouteDto, RoutePoint } from '../models/route.model';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class RouteService {
  private readonly STORAGE_KEY = 'saved_routes';

  private http = inject(HttpClient);

  private _fetchedRouteDtos = signal<RouteDto[]>([]);
  private _savedRoutes = signal<Route[]>([]);
  private _currentRouteIndex = signal<number>(0);

  destinationPoints = computed<RoutePoint[]>(
    () =>
      this._savedRoutes()[this._currentRouteIndex()]?.points.filter(
        (dp) => !dp.markedAsVisited
      ) || []
  );

  constructor() {
    this.loadRoutesFromStorage();

    effect(() => {
      const routes = this._savedRoutes();
      if (routes.length > 0) {
        this.saveRoutesToStorage(routes);
      }
    });
  }

  fetchRoutes(): void {
    // this.http.get<RouteDto[]>('api/route').subscribe((routes) => {
    // this._fetchedRouteDtos.set(routes);
    // this._savedRoutes.set(
    //   routes.map((dto) => ({
    //     id: dto.id,
    //     points: dto.points.map((point) => ({
    //       point: latLng(point.lat, point.lng),
    //       address: point.address,
    //       additionalInfo: point.additionalInfo,
    //       markedAsVisited: false,
    //     })),
    //   }))
    // );
    // this._currentRouteIndex.set(0);
    // });
    const routes: RouteDto[] = [
      {
        id: 1,
        points: [
          {
            lat: 52.2297,
            lng: 21.0122,
            additionalInfo: 'Paczka na 2 pietro',
            address: 'Warsaw, Poland',
          },
          { lat: 52.4064, lng: 16.9252 },
          { lat: 51.1079, lng: 17.0385 },
          { lat: 50.0647, lng: 19.945 },
        ],
      },
      {
        id: 2,
        points: [
          {
            lat: 49.2297,
            lng: 18.0122,
            additionalInfo: 'Paczka na 2 pietro',
            address: 'Bielsko, Poland',
          },
          { lat: 65.4064, lng: 4.9252 },
          { lat: 51.1079, lng: 17.0385 },
          { lat: 50.0647, lng: 19.945 },
        ],
      },
    ];
    this._fetchedRouteDtos.set(routes);
    this._savedRoutes.set(
      routes.map((dto) => ({
        id: dto.id,
        points: dto.points.map((point) => ({
          point: latLng(point.lat, point.lng),
          address: point.address,
          additionalInfo: point.additionalInfo,
          markedAsVisited: false,
        })),
      }))
    );
    this._currentRouteIndex.set(0);
  }

  fetchRoutesIfEmpty(): void {
    if (this._savedRoutes().length === 0) {
      this.fetchRoutes();
    }
  }

  showNextRoute(): void {
    const nextIndex = this._currentRouteIndex() + 1;
    if (nextIndex < this._savedRoutes().length) {
      this._currentRouteIndex.set(nextIndex);
    }
  }

  showPreviousRoute(): void {
    const prevIndex = this._currentRouteIndex() - 1;
    if (prevIndex >= 0) {
      this._currentRouteIndex.set(prevIndex);
    }
  }

  markPointAsVisited(point: RoutePoint): void {
    this._savedRoutes.update((routes) => {
      const currentRoute = routes[this._currentRouteIndex()];
      if (!currentRoute) {
        return routes;
      }

      const pointIndex = currentRoute.points.indexOf(point);
      if (pointIndex === -1) {
        return routes;
      }

      currentRoute.points[pointIndex].markedAsVisited = true;
      return [...routes];
    });
  }

  private async loadRoutesFromStorage(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: this.STORAGE_KEY });
      if (value) {
        const routes: Route[] = JSON.parse(value);
        this._savedRoutes.set(routes);
      }
    } catch (error) {
      console.error('Error loading routes from storage:', error);
    }
  }

  private async saveRoutesToStorage(routes: Route[]): Promise<void> {
    try {
      await Preferences.set({
        key: this.STORAGE_KEY,
        value: JSON.stringify(routes),
      });
    } catch (error) {
      console.error('Error saving routes to storage:', error);
    }
  }
}
