from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware

from models.login import LoginRequest, LoginResponse
from models.route import Route
from routes_service import RoutesService
from auth_service import AuthService

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
auth_service = AuthService()


@app.post("/auth/login")
async def login(request: LoginRequest) -> LoginResponse:
    token = auth_service.login(request.username, request.password)
    if not token:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return LoginResponse(token=token)

@app.get("/routes")
async def get_routes(authorization: str = Header(None)) -> list[Route]:
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    
    if not auth_service.validate_token(token):
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return routes_service.get_routes()

@app.delete("/routes/{route_id}")
async def delete_route(route_id: int) -> None:
    routes_service.remove_route(route_id)