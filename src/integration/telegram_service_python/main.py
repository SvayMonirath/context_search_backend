import uvicorn, os
from dotenv import load_dotenv
from fastapi import FastAPI
from routes.connect import router as connect_router
from routes.verify import router as verify_router
from routes.sync import router as sync_router

load_dotenv()

app = FastAPI()

app.include_router(connect_router, prefix="/telegram")
app.include_router(verify_router, prefix="/telegram")
app.include_router(sync_router, prefix="/telegram")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PYTHON_BACKEND_PORT", 8001)),
        reload=True
    )
