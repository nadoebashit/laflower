import os
from decimal import Decimal
import uuid
import shutil

from fastapi import HTTPException, status, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Expense
from app.repositories.expense_repository import ExpenseRepository
from app.repositories.flower_repository import FlowerRepository
from app.schemas.expense import ExpenseCreate, ExpenseListResponse, ExpenseResponse


class ExpenseService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.expense_repository = ExpenseRepository(session)
        self.flower_repository = FlowerRepository(session)

    async def list(self, business_id: int, offset: int, limit: int) -> ExpenseListResponse:
        expenses, total = await self.expense_repository.get_list(business_id=business_id, offset=offset, limit=limit)
        return ExpenseListResponse(
            total=total,
            offset=offset,
            limit=limit,
            items=[ExpenseResponse.model_validate(item) for item in expenses],
        )

    async def create(
        self,
        business_id: int,
        payload: ExpenseCreate,
        file: UploadFile | None = None
    ) -> ExpenseResponse:
        amount = payload.amount
        photo_url = None

        if file:
            # Handle photo upload
            business_dir = os.path.join("static", "uploads", str(business_id))
            os.makedirs(business_dir, exist_ok=True)
            
            file_extension = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
            filename = f"{uuid.uuid4()}{file_extension}"
            file_path = os.path.join(business_dir, filename)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
                
            photo_url = f"/static/uploads/{business_id}/{filename}"

        if payload.flower_id:
            flower = await self.flower_repository.get_by_id(business_id, payload.flower_id)
            if not flower:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Flower not found",
                )
            
            if not payload.quantity or payload.quantity <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Quantity is required and must be positive when specifying a flower",
                )

            if flower.stock_quantity < payload.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Not enough stock. Available: {flower.stock_quantity}",
                )

            flower.stock_quantity -= payload.quantity
            await self.flower_repository.update(flower)
            
            if amount is None:
                amount = flower.purchase_price * payload.quantity
        else:
            if amount is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Amount is required when no flower is specified",
                )

        expense = Expense(
            business_id=business_id,
            flower_id=payload.flower_id,
            quantity=payload.quantity,
            amount=amount,
            description=payload.description,
            photo_url=photo_url,
        )

        expense = await self.expense_repository.create(expense)
        return ExpenseResponse.model_validate(expense)
