from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models.route import Route
from routes_service import RoutesService

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200", 
        "https://localhost",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

routes_service = RoutesService()

@app.get("/routes")
async def root() -> list[Route]:
    return routes_service.get_routes()

@app.delete("/routes/{route_id}")
async def delete_route(route_id: int) -> None:
    routes_service.remove_route(route_id)