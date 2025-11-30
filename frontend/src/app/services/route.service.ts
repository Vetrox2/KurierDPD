import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { latLng } from 'leaflet';
import { Route, RouteDto, RoutePoint } from '../models/route.model';
import { Preferences } from '@capacitor/preferences';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class RouteService {
  private readonly STORAGE_KEY = 'saved_routes';
  private readonly API_URL = 'https://kurierdpd-production.up.railway.app';

  private http = inject(HttpClient);
  private authService = inject(AuthService);

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
    effect(() => {
      const routes = this._savedRoutes();
      if (routes.length > 0) {
        this.saveRoutesToStorage(routes);
      }
    });
  }

  fetchRoutes(): void {
    const token = this.authService.authToken();
    if (!token) {
      throw new Error('No auth token available');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get<RouteDto[]>(`${this.API_URL}/routes`, { headers })
      .subscribe((routes) => {
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
      });
  }

  async initRoutes(): Promise<void> {
    await this.loadRoutesFromStorage();
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

      if (currentRoute.points.every((p) => p.markedAsVisited)) {
        this.removeRouteApiRequest(currentRoute.id);
        routes.splice(this._currentRouteIndex(), 1);
        this._currentRouteIndex.set(0);
      }

      return [...routes];
    });
  }

  private async removeRouteApiRequest(routeId: number): Promise<void> {
    this.http.delete(`${this.API_URL}/routes/${routeId}`).subscribe();
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
