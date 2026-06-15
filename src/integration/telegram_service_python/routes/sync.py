import os
from fastapi import APIRouter
from telegram_client import get_telegram_client

router = APIRouter()

def get_sender_name(sender):
    return (
        getattr(sender, "first_name", None)
        or getattr(sender, "title", None)
        or "Unknown"
    )

@router.post("/sync-telegram")
async def sync_telegram(data: dict):
    integration_id = data.get("integration_id")
    last_sync = data.get("last_sync", {})

    chat_limit = data.get("chat_limit", 10)
    message_limit = data.get("message_limit", 40)

    client = get_telegram_client(integration_id)
    await client.connect()

    messages = []
    raw_message_ids = []  # Tracks raw integers for safe mathematical calculations
    chat_states = {}

    last_global_id = last_sync.get("lastMessageId")
    if last_global_id is not None:
        try:
            last_global_id = int(last_global_id)
        except ValueError:
            last_global_id = None

    chat_count = 0

    async for dialog in client.iter_dialogs():
        if chat_count >= chat_limit:
            break

        chat_count += 1

        # Safely fall back and handle previous tracking IDs
        chat_last_id_raw = last_sync.get("chatStates", {}).get(str(dialog.id), 0)
        try:
            chat_last_id = int(chat_last_id_raw)
        except (ValueError, TypeError):
            chat_last_id = 0

        async for msg in client.iter_messages(dialog.id, limit=message_limit):
            if chat_last_id and msg.id <= chat_last_id:
                continue

            if last_global_id and msg.id <= last_global_id:
                continue

            sender = await msg.get_sender()

            if msg.text:
                raw_message_ids.append(msg.id)

                messages.append({
                    "message_id": str(msg.id),  # Safely stringified for JS/Prisma
                    "chat_id": str(dialog.id),   # Safely stringified for JS/Prisma
                    "chat_title": str(dialog.name or "Untitled Chat"),
                    "sender_id": str(msg.sender_id) if msg.sender_id else None,
                    "sender_name": get_sender_name(sender),
                    "text": msg.text,
                    "date": msg.date.isoformat(),
                })

                # Tracking chat state max using integers
                current_max = chat_states.get(str(dialog.id), 0)
                chat_states[str(dialog.id)] = max(current_max, msg.id)

    # Calculate actual numeric max, then turn into a string
    last_msg_id_numeric = max(raw_message_ids, default=0)
    lastMessageId = str(last_msg_id_numeric)

    return {
        "messages": messages,
        "lastMessageId": lastMessageId,
        "chatStates": chat_states,
    }
