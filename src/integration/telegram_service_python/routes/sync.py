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
    try:
        print("(api call) /sync-telegram with data:", data)
        integration_id = data.get("integration_id")
        # Stored sync state from database
        last_sync = data.get("last_sync", {})
        # Keep chat_limit only for testing
        chat_limit = data.get("chat_limit", 10)
        sender_cache = {}

        client = get_telegram_client(integration_id)

        if not client.is_connected():
            await client.connect()
        authorized = await client.is_user_authorized()

        if not authorized:
            print("Client not authorized")
            return {
                "error": "Client not authorized"
            }

        messages = []

        # New sync state that will be returned
        updated_chat_states = {}
        chat_count = 0

        print("Iterating through dialogs")
        async for dialog in client.iter_dialogs():

            if chat_count >= chat_limit:
                break

            chat_count += 1

            chat_id = str(dialog.id)

            # Get previously synced message ID
            chat_last_id = (
                last_sync
                .get("chatStates", {})
                .get(chat_id, 0)
            )

            try:
                chat_last_id = int(chat_last_id)
            except (TypeError, ValueError):
                chat_last_id = 0

            # Preserve current state even if no new messages arrive
            updated_chat_states[chat_id] = chat_last_id

            highest_message_id = chat_last_id

            async for msg in client.iter_messages(
                dialog.id,
                min_id=chat_last_id
            ):

                if not msg.text:
                    continue


                # sender = await msg.get_sender()
                sender_id = msg.sender_id
                if sender_id in sender_cache:
                    sender = sender_cache[sender_id]
                else:
                    sender = await msg.get_sender()
                    sender_cache[sender_id] = sender


                messages.append({
                    "message_id": str(msg.id),
                    "chat_id": chat_id,
                    "chat_title": str(dialog.name or "Untitled Chat"),
                    "sender_id": str(msg.sender_id) if msg.sender_id else None,
                    "sender_name": get_sender_name(sender),
                    "text": msg.text,
                    "date": msg.date.isoformat(),
                })

                if msg.id > highest_message_id:
                    highest_message_id = msg.id

            updated_chat_states[chat_id] = highest_message_id

        print(f"Finished syncing. Total messages: {len(messages)}")
        return {
            "messages": messages,
            "chatStates": updated_chat_states,
        }
    except Exception as e:
        print("Error during sync:", str(e))
        return {
            "error": str(e)
        }
