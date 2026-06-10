from telethon import TelegramClient
import os
from dotenv import load_dotenv

load_dotenv()
clients = {}

API_ID = os.getenv("TELEGRAM_API_ID")
API_HASH = os.getenv("TELEGRAM_API_HASH")

def get_telegram_client(integration_id: str) :
  if integration_id in clients:
    return clients[integration_id]

  os.makedirs("sessions", exist_ok=True)
  session_path = f"sessions/{integration_id}"

  client = TelegramClient(session_path, API_ID, API_HASH)
  clients[integration_id] = client
  return client

