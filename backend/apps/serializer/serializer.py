from pydantic import BaseModel


class ItemCreate(BaseModel):
    name: str
    description: str


class ItemRead(ItemCreate):
    id: int

    class Config:
        orm_mode = True
