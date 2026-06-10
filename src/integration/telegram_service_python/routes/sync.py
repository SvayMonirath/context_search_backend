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

    chat_limit = data.get("chat_limit", 20)
    message_limit = data.get("message_limit", 50)

    client = get_telegram_client(integration_id)
    await client.connect()

    messages = []
    chat_states = {}

    last_global_id = last_sync.get("lastMessageId")

    chat_count = 0

    async for dialog in client.iter_dialogs():

        if chat_count >= chat_limit:
            break

        chat_count += 1

        chat_last_id = last_sync.get("chatStates", {}).get(str(dialog.id), 0)

        msg_count = 0

        async for msg in client.iter_messages(dialog.id, limit=message_limit):

            msg_count += 1

            if chat_last_id and msg.id <= chat_last_id:
                continue

            if last_global_id and msg.id <= last_global_id:
                continue

            sender = await msg.get_sender()

            if msg.text:
                messages.append({
                    "message_id": msg.id,
                    "chat_id": dialog.id,
                    "chat_title": dialog.name,
                    "sender_id": msg.sender_id,
                    "sender_name": get_sender_name(sender),
                    "text": msg.text,
                    "date": msg.date.isoformat(),
                })

                chat_states[str(dialog.id)] = max(
                    chat_states.get(str(dialog.id), 0),
                    msg.id
                )

    lastMessageId = messages[-1]["message_id"] if messages else 0

    return {
        "messages": messages,
        "lastMessageId": lastMessageId,
        "chatStates": chat_states,
    }
