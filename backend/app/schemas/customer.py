from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr


class CustomerCreate(CustomerBase):
    phone: str = Field(..., description="10-digit phone number")

    @field_validator("phone")
    @classmethod
    def _ten_digits(cls, value: str) -> str:
        digits = "".join(ch for ch in value if ch.isdigit())
        if len(digits) != 10:
            raise ValueError("Phone number must be exactly 10 digits")
        return digits


class CustomerOut(CustomerBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    phone: str | None = None
    created_at: datetime
    updated_at: datetime
