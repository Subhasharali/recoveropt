from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .routers import payments, recovery
from .seed import seed_data

# Initialize Database
Base.metadata.create_all(bind=engine)
seed_data()

app = FastAPI(title="RecoverOpt API")

# Configure CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, adjust in production
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include routers
app.include_router(payments.router)
app.include_router(recovery.router)

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Backend is connected"}
