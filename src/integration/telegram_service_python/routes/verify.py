from fastapi import APIRouter
from telegram_client import get_telegram_client

router = APIRouter()

@router.post("/verify-code")
async def verify(data: dict):
  integration_id = data.get("integration_id")
  phone_code_hash = data.get("phone_code_hash")
  phone = data.get("phone")
  code = data.get("code")

  client = get_telegram_client(integration_id)
  await client.connect()

  await client.sign_in(phone=phone, code=code, phone_code_hash=phone_code_hash)
  return {
    "status": "connected"
  }

