from datetime import datetime
from models.route import Route, RoutePoint


class RoutesService:
    def __init__(self):
        self.__routes: list[Route] = mocked_routes

    def get_routes(self) -> list[Route]:
        today_routes = [
            route for route in self.__routes
            if route.date == datetime.today().strftime("%Y-%m-%d")
        ]
        return today_routes[:3]
    
    def remove_route(self, route_id: int) -> None:
        self.__routes = [
            route for route in self.__routes 
            if route.id != route_id
        ]
    

mocked_routes = [
            Route(
                id=11,
                points=[
                    RoutePoint(lat=49.857525, lng=19.102666, address="Bielsko-Biała, ul. Główna 5", additionalInfo="Paczka przy kasie"),
                    RoutePoint(lat=49.803514, lng=19.063549, address="Bielsko-Biała, ul. Nowa 12", additionalInfo="Mieszkanie 3"),
                    RoutePoint(lat=49.792619, lng=19.047254, address="Bielsko-Biała, ul. Stara 8", additionalInfo="Paczka za drzwiami"),
                ],
                date="2025-11-29",
            ),
            Route(
                id=12,
                points=[
                    RoutePoint(lat=49.8260, lng=19.1560, address="Bielsko-Biała, ul. Ceglana 18", additionalInfo="Dom z żółtym dachem"),
                    RoutePoint(lat=49.8175, lng=19.1420, address="Bielsko-Biała, ul. Piękna 7", additionalInfo="Paczka na balkonie"),
                    RoutePoint(lat=49.8145, lng=19.1390, address="Bielsko-Biała, ul. Kwiatowa 24", additionalInfo="Obok paczkomatu"),
                ],
                date="2025-11-29",
            ),
            Route(
                id=13,
                points=[
                    RoutePoint(lat=49.8190, lng=19.1440, address="Bielsko-Biała, ul. Różowa 11", additionalInfo="Przesyłka do poniedziałku"),
                    RoutePoint(lat=49.8205, lng=19.1410, address="Bielsko-Biała, ul. Fioletowa 6", additionalInfo="Mieszkanie 2"),
                    RoutePoint(lat=49.8220, lng=19.1380, address="Bielsko-Biała, ul. Turkusowa 19", additionalInfo="Paczka w paczkomacie"),
                ],
                date="2025-11-30",
            ),
            Route(
                id=14,
                points=[
                    RoutePoint(lat=49.8280, lng=19.1590, address="Bielsko-Biała, ul. Granatowa 3", additionalInfo="Dom jednorodzinny"),
                    RoutePoint(lat=49.8295, lng=19.1620, address="Bielsko-Biała, ul. Purpurowa 14", additionalInfo="Paczka pod domem"),
                    RoutePoint(lat=49.8310, lng=19.1650, address="Bielsko-Biała, ul. Karminowa 9", additionalInfo="Mieszkanie 4"),
                ],
                date="2025-11-30",
            ),
            Route(
                id=1,
                points=[
                    RoutePoint(lat=49.7941, lng=19.0528, address="Bielsko-Biała, ul. Olszówka 9", additionalInfo="Paczka na parterze"),
                    RoutePoint(lat=49.8148, lng=19.0438, address="Bielsko-Biała, ul. Partyzantów 44", additionalInfo="Dzwonek obok drewni"),
                    RoutePoint(lat=49.8027, lng=19.0504, address="Bielsko-Biała, ul. Leszczyńska 20", additionalInfo="Paczka do Drive-through"),
                ],
                date="2025-12-01",
            ),
            Route(
                id=2,
                points=[
                    RoutePoint(lat=49.8218, lng=19.0447, address="Bielsko-Biała, ul. Armii Krajowej 20", additionalInfo="Dom jednorodzinny"),
                    RoutePoint(lat=49.8199, lng=19.0491, address="Bielsko-Biała, ul. Warszawska 45", additionalInfo="Paczka na 3 piętrze"),
                    RoutePoint(lat=49.8162, lng=19.0538, address="Bielsko-Biała, ul. Żywiecka 12", additionalInfo="Oddać do sąsiada"),
                ],
                date="2025-12-01",
            ),
            Route(
                id=3,
                points=[
                    RoutePoint(lat=49.8256, lng=19.0569, address="Bielsko-Biała, ul. Józefa Piłsudskiego 47", additionalInfo="Uwaga na dzieci!"),
                    RoutePoint(lat=49.8231, lng=19.0604, address="Bielsko-Biała, ul. Prusa 7", additionalInfo="Załóż na paczce"),
                    RoutePoint(lat=49.8208, lng=19.0628, address="Bielsko-Biała, ul. Tetmajera 22", additionalInfo="Brama z lewej strony"),
                ],
                date="2025-12-01",
            ),
            Route(
                id=4,
                points=[
                    RoutePoint(lat=49.8183, lng=19.0412, address="Bielsko-Biała, ul. Chrobrego 5", additionalInfo="Paczka do salonu"),
                    RoutePoint(lat=49.8172, lng=19.0455, address="Bielsko-Biała, ul. Adama Asnyka 18", additionalInfo="Nie dzwonić, wrzucić do skrzynki"),
                    RoutePoint(lat=49.8157, lng=19.0483, address="Bielsko-Biała, ul. Kopernika 9", additionalInfo="Paczka za bramą"),
                ],
                date="2025-12-01",
            ),
            Route(
                id=5,
                points=[
                    RoutePoint(lat=49.8272, lng=19.0651, address="Bielsko-Biała, ul. Stefana Żeromskiego 14", additionalInfo="Mieszkanie 5"),
                    RoutePoint(lat=49.8243, lng=19.0687, address="Bielsko-Biała, ul. Bohaterów Westerplatte 11", additionalInfo="Paczka pod drzwiami"),
                    RoutePoint(lat=49.8219, lng=19.0715, address="Bielsko-Biała, ul. Wyspiańskiego 25", additionalInfo="Dzwonek elektryczny"),
                ],
                date="2025-12-01",
            ),
            Route(
                id=6,
                points=[
                    RoutePoint(lat=49.8195, lng=19.0425, address="Bielsko-Biała, ul. Kossaka 3", additionalInfo="Paczka na balkonie"),
                    RoutePoint(lat=49.8211, lng=19.0467, address="Bielsko-Biała, ul. Leśna 16", additionalInfo="Mieszkanie z widokiem"),
                    RoutePoint(lat=49.8227, lng=19.0503, address="Bielsko-Biała, ul. Parkowa 8", additionalInfo="Obok poczty"),
                ],
                date="2025-12-02",
            ),
            Route(
                id=7,
                points=[
                    RoutePoint(lat=49.8178, lng=19.0521, address="Bielsko-Biała, ul. Słoneczna 6", additionalInfo="Dom z białą bramą"),
                    RoutePoint(lat=49.8163, lng=19.0559, address="Bielsko-Biała, ul. Sportowa 12", additionalInfo="Gimnazjum obok"),
                    RoutePoint(lat=49.8149, lng=19.0593, address="Bielsko-Biała, ul. Winogron 4", additionalInfo="Paczka na parterze"),
                ],
                date="2025-12-02",
            ),
            Route(
                id=8,
                points=[
                    RoutePoint(lat=49.8264, lng=19.0614, address="Bielsko-Biała, ul. Ścieżka 19", additionalInfo="Numer 19a"),
                    RoutePoint(lat=49.8247, lng=19.0648, address="Bielsko-Biała, ul. Widok 7", additionalInfo="Dzwonek odbity"),
                    RoutePoint(lat=49.8231, lng=19.0681, address="Bielsko-Biała, ul. Zielona 21", additionalInfo="Paczka w lodówce"),
                ],
                date="2025-12-02",
            ),
            Route(
                id=9,
                points=[
                    RoutePoint(lat=49.8142, lng=19.0432, address="Bielsko-Biała, ul. Dolna 10", additionalInfo="Paczka do piwnicy"),
                    RoutePoint(lat=49.8129, lng=19.0471, address="Bielsko-Biała, ul. Górna 27", additionalInfo="Mieszkanie 7"),
                    RoutePoint(lat=49.8115, lng=19.0507, address="Bielsko-Biała, ul. Środkowa 5", additionalInfo="Obok apoteki"),
                ],
                date="2025-12-02",
            ),
            Route(
                id=10,
                points=[
                    RoutePoint(lat=49.8202, lng=19.0542, address="Bielsko-Biała, ul. Krótka 2", additionalInfo="Paczka w przejściu"),
                    RoutePoint(lat=49.8217, lng=19.0577, address="Bielsko-Biała, ul. Długa 30", additionalInfo="Numer z daszkiem"),
                    RoutePoint(lat=49.8233, lng=19.0611, address="Bielsko-Biała, ul. Środowiska 13", additionalInfo="Blok A, paczka na wycieraczce"),
                ],
                date="2025-12-02",
            ),
        ]