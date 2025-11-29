import {
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
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
import { RouteService } from '../../services/route.service';
import { RoutePoint } from '../../models/route.model';

@Component({
  selector: 'app-home',
  imports: [LeafletModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  readonly MAX_ZOOM: number = 19;
  readonly MAP_OPTIONS: MapOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: this.MAX_ZOOM,
        attribution: '© OpenStreetMap contributors',
      }),
    ],
  };

  private routeService = inject(RouteService);

  destinationPoints = this.routeService.destinationPoints;
  routePoints = computed<LatLng[]>(() => {
    const currentPos = this.currentPosition();
    return currentPos
      ? [currentPos, ...this.destinationPoints().map((dp) => dp.point)]
      : this.destinationPoints().map((dp) => dp.point);
  });

  private followMode = signal(false);
  private currentPosition = signal<LatLng | undefined>(undefined);
  private map = signal<Map | undefined>(undefined);
  private markers = computed<Marker[]>(() =>
    this.mapRoutePointsToMarkers(
      this.destinationPoints(),
      this.currentPosition()
    )
  );
  private routeControl?: L.Routing.Control;
  private watchId?: string;
  private currentMarkersOnMap: Marker[] = [];

  constructor() {
    effect(() => {
      const map = this.map();
      if (!map) {
        return;
      }

      this.updateMarkersOnMap(map, this.markers());
      this.updateRoute(map);

      if (this.followMode()) {
        this.center();
      }
    });
  }

  ngOnInit(): void {
    this.routeService.initRoutes();
    this.initializeLocationTracking();
  }

  ngOnDestroy(): void {
    if (this.watchId) {
      Geolocation.clearWatch({ id: this.watchId });
    }
  }

  onMapReady(map: Map): void {
    this.map.set(map);
    this.addCustomControls(map);

    map.on('dragstart', () => {
      this.followMode.set(false);
    });
  }

  showAllRoutePoints(): void {
    this.followMode.set(false);
    const map = this.map();
    if (!map) {
      return;
    }

    const group = L.featureGroup(this.markers());
    map.fitBounds(group.getBounds().pad(0.1));
  }

  center(): void {
    this.followMode.set(true);
    const map = this.map();
    if (!map || this.markers().length === 0) {
      return;
    }

    map.setView(this.markers()[0].getLatLng(), this.MAX_ZOOM);
  }

  markNextPointAsVisited(): void {
    const nextPoint = this.destinationPoints()[0];
    if (nextPoint) {
      this.routeService.markPointAsVisited(nextPoint);
    }
  }

  fetchNewRoutes(): void {
    if (
      confirm('Fetching new routes will remove all saved routes. Continue?')
    ) {
      this.routeService.fetchRoutes();
    }
  }

  private mapRoutePointsToMarkers(
    routePoints: RoutePoint[],
    currentPosition: LatLng | undefined
  ): Marker[] {
    const markers: Marker[] = [];

    if (currentPosition) {
      const currentPosMarker = marker(currentPosition, {
        icon: L.divIcon({
          className: 'current-position-marker',
          html: '<div style="font-size: 28px; text-align: center;">🚗</div>',
          iconSize: [42, 42],
        }),
      }).bindPopup('My current position');
      markers.push(currentPosMarker);
    }

    routePoints.forEach((routePoint) => {
      const destinationMarker = marker(routePoint.point, {
        icon: icon({
          ...Icon.Default.prototype.options,
          iconUrl: 'assets/marker-icon.png',
          iconRetinaUrl: 'assets/marker-icon-2x.png',
          shadowUrl: 'assets/marker-shadow.png',
        }),
      }).bindPopup(
        `Address: ${routePoint.address || 'N/A'}<br/>Additional Info: ${
          routePoint.additionalInfo || 'N/A'
        }`
      );
      markers.push(destinationMarker);
    });

    return markers;
  }

  private updateMarkersOnMap(map: Map, markers: Marker[]): void {
    this.currentMarkersOnMap.forEach((m) => m.remove());
    markers.forEach((m) => m.addTo(map));
    this.currentMarkersOnMap = markers;
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
      collapsible: true,
      show: false,
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

  private async initializeLocationTracking(): Promise<void> {
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
          }
        }
      );
    } catch (error) {
      console.error('Error initializing location tracking:', error);
    }
  }

  private addCustomControls(map: Map): void {
    const centerControl = this.createCustomMapControl(
      'topleft',
      'Center on my position',
      '📍',
      () => this.center()
    );

    const fitBoundsControl = this.createCustomMapControl(
      'topleft',
      'Show all route points',
      '🗺️',
      () => this.showAllRoutePoints()
    );

    const markVisitedControl = this.createCustomMapControl(
      'topright',
      'Mark next point as visited',
      '✅',
      () => this.markNextPointAsVisited()
    );

    const nextRouteControl = this.createCustomMapControl(
      'bottomright',
      'Next route',
      '⏭️',
      () => this.routeService.showNextRoute()
    );

    const previousRouteControl = this.createCustomMapControl(
      'bottomright',
      'Previous route',
      '⏮️',
      () => this.routeService.showPreviousRoute()
    );

    const fetchRoutesControl = this.createCustomMapControl(
      'bottomleft',
      'Fetch new routes',
      '🔄',
      () => this.fetchNewRoutes()
    );

    new centerControl().addTo(map);
    new fitBoundsControl().addTo(map);
    new markVisitedControl().addTo(map);
    new nextRouteControl().addTo(map);
    new previousRouteControl().addTo(map);
    new fetchRoutesControl().addTo(map);
  }

  private createCustomMapControl(
    position: string,
    title: string,
    innerHTML: string,
    onClick: () => void
  ) {
    return L.Control.extend({
      options: {
        position: position,
      },
      onAdd: () => {
        const container = L.DomUtil.create(
          'div',
          'leaflet-bar leaflet-control'
        );
        const button = L.DomUtil.create('a', '', container);
        button.innerHTML = innerHTML;
        button.href = '#';
        button.title = title;
        button.style.fontSize = '20px';
        button.style.width = '30px';
        button.style.height = '30px';
        button.style.lineHeight = '30px';
        button.style.textAlign = 'center';
        button.style.display = 'block';
        button.style.textDecoration = 'none';

        L.DomEvent.on(button, 'click', (e: Event) => {
          L.DomEvent.preventDefault(e);
          onClick();
        });

        return container;
      },
    });
  }
}
