import { Component, computed, effect, signal } from '@angular/core';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import {
  Icon,
  icon,
  latLng,
  LatLng,
  Map,
  MapOptions,
  marker,
  Marker,
  tileLayer,
} from 'leaflet';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-home',
  imports: [LeafletModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  readonly MAX_ZOOM: number = 19;
  readonly MAP_OPTIONS: MapOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: this.MAX_ZOOM,
        attribution: '© OpenStreetMap contributors',
      }),
    ],
  };

  destinationPoints = signal<LatLng[]>([
    latLng(52.2297, 21.0122),
    latLng(52.4064, 16.9252),
    latLng(51.1079, 17.0385),
    latLng(50.0647, 19.945),
  ]);

  routePoints = computed<LatLng[]>(() => {
    const currentPos = this.currentPosition();
    return currentPos
      ? [currentPos, ...this.destinationPoints()]
      : this.destinationPoints();
  });

  private currentPosition = signal<LatLng | undefined>(undefined);
  private map = signal<Map | undefined>(undefined);
  private markers = computed<Marker[]>(() =>
    this.mapRoutePointsToMarkers(this.routePoints())
  );
  private routeControl?: L.Routing.Control;
  private watchId?: string;

  constructor() {
    this.initializeLocationTracking();

    effect(() => {
      const map = this.map();
      if (!map) {
        return;
      }

      const markers = this.markers();
      this.updateMarkersOnMap(map, markers);
      this.updateRoute(map);
    });
  }

  async initializeLocationTracking(): Promise<void> {
    try {
      const position = await Geolocation.getCurrentPosition();
      this.currentPosition.set(
        latLng(position.coords.latitude, position.coords.longitude)
      );

      this.watchId = await Geolocation.watchPosition(
        {
          maximumAge: 5000,
        },
        (position, err) => {
          if (err) {
            console.error('Error watching location:', err);
            return;
          }
          if (position) {
            this.currentPosition.set(
              latLng(position.coords.latitude, position.coords.longitude)
            );
            console.log('Updated position:', this.currentPosition());
          }
        }
      );
    } catch (error) {
      console.error('Error initializing location tracking:', error);
    }
  }

  ngOnDestroy(): void {
    if (this.watchId) {
      Geolocation.clearWatch({ id: this.watchId });
    }
  }

  onMapReady(map: Map): void {
    this.map.set(map);
  }

  showAllRoutePoints(): void {
    const map = this.map();
    if (!map) {
      return;
    }

    const group = L.featureGroup(this.markers());
    map.fitBounds(group.getBounds().pad(0.1));
  }

  center(): void {
    const map = this.map();
    if (!map || this.markers().length === 0) {
      return;
    }

    map.setView(this.markers()[0].getLatLng(), this.MAX_ZOOM);
  }

  private mapRoutePointsToMarkers(points: LatLng[]): Marker[] {
    return points.map((point, index) =>
      marker(point, {
        icon: icon({
          ...Icon.Default.prototype.options,
          iconUrl: 'assets/marker-icon.png',
          iconRetinaUrl: 'assets/marker-icon-2x.png',
          shadowUrl: 'assets/marker-shadow.png',
        }),
      }).bindPopup(`Point ${index + 1}`)
    );
  }

  private updateMarkersOnMap(map: Map, markers: Marker[]): void {
    markers.forEach((m) => m.remove());
    markers.forEach((m) => m.addTo(map));
  }

  private createRoute(map: Map): void {
    this.routeControl = (L as any).Routing.control({
      waypoints: this.routePoints(),
      routeWhileDragging: false,
      showAlternatives: false,
      addWaypoints: false,
      lineOptions: {
        styles: [{ color: '#6FA1EC', weight: 4 }],
      },
      createMarker: () => {
        return null as any;
      },
    }).addTo(map);
  }

  private updateRoute(map: Map): void {
    if (!this.routeControl) {
      this.createRoute(map);
      return;
    }

    this.routeControl.setWaypoints(this.routePoints());
    this.routeControl.route();
  }
}
