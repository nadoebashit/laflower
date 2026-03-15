from fastapi import APIRouter

from app.api.v1.endpoints import auth, bouquets, flowers, reports

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(flowers.router)
api_router.include_router(bouquets.router)
api_router.include_router(reports.router)
