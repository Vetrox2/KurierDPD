from dataclasses import dataclass

@dataclass
class RoutePoint:
    lat: float
    lng: float
    address: str | None = None
    additionalInfo: str | None = None

@dataclass
class Route:
    id: int
    points: list[RoutePoint]
    date: str | None = None
