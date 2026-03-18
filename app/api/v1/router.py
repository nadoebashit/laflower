from fastapi import APIRouter

from app.api.v1.endpoints import auth, bouquets, flowers, reports, expenses

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(flowers.router)
api_router.include_router(bouquets.router)
api_router.include_router(reports.router)
api_router.include_router(expenses.router)
