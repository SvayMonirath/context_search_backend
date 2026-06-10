from fastapi import APIRouter, FastAPI
from telegram_client import get_telegram_client

router = APIRouter()

@router.post("/connect")
async def connect(data: dict):
  integration_id = data.get("integration_id")
  phone = data.get("phone")

  client = get_telegram_client(integration_id)
  await client.connect()

  result = await client.send_code_request(phone)
  return {
    "phone_code_hash": result.phone_code_hash
  }
