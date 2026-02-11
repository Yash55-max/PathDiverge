"""
PathDiverge FastAPI Backend
Clean API layer for career simulation engine
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import sys
import os

# Add parent directory to path to import simulator
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from simulator import run_simulation, run_comparative_analysis

app = FastAPI(title="PathDiverge API", version="1.0.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SimulationRequest(BaseModel):
    specialization: str = "none"  # "early" or "none"
    risk_level: str = "medium"    # "low", "medium", or "high"
    iterations: int = 2500
    compute_ci: bool = False
    ci_iterations: Optional[int] = 30


class ComparativeRequest(BaseModel):
    iterations: int = 2500
    compute_ci: bool = False


@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "PathDiverge Career Simulator",
        "version": "1.0.0"
    }


@app.post("/simulate")
def simulate(request: SimulationRequest):
    """
    Run a single simulation with specified parameters
    
    Returns structured results with metrics, distributions, and metadata
    """
    config = {
        "specialization": request.specialization,
        "risk_level": request.risk_level,
        "iterations": request.iterations,
        "compute_ci": request.compute_ci,
        "ci_iterations": request.ci_iterations
    }
    
    results = run_simulation(config)
    return results


@app.post("/comparative")
def comparative(request: ComparativeRequest):
    """
    Run comparative analysis across all three interventions:
    - Control (no specialization, medium risk)
    - Specialist (early specialization, medium risk)
    - Risk-taker (no specialization, high risk)
    
    Returns results for all interventions plus deltas
    """
    results = run_comparative_analysis(
        iterations=request.iterations,
        compute_ci=request.compute_ci
    )
    
    return results


@app.get("/health")
def health():
    """Detailed health check"""
    return {
        "status": "healthy",
        "simulator": "loaded",
        "endpoints": [
            "/",
            "/simulate",
            "/comparative",
            "/health"
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
