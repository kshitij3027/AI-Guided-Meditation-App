from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn
import os
from termcolor import colored
from typing import Dict, List, Optional

# Constants
MEDITATIONS = {
    "mindfulness": {
        "title": "Mindfulness Meditation",
        "instructions": [
            "Find a comfortable position and close your eyes.",
            "Take a deep breath in through your nose...",
            "And slowly exhale through your mouth...",
            "Focus on your breath, noticing the sensation of air flowing in and out.",
            "If your mind wanders, gently bring your attention back to your breath.",
            "Continue breathing deeply and mindfully."
        ],
        "duration": 300,  # 5 minutes in seconds
        "animation_color": "from-primary to-secondary"
    },
    "relaxation": {
        "title": "Relaxation Meditation",
        "instructions": [
            "Settle into a comfortable position and close your eyes.",
            "Take a slow, deep breath in...",
            "And release, letting go of any tension...",
            "Feel your body becoming heavier with each breath.",
            "Relax your shoulders, your arms, your legs...",
            "Let go of all stress and worry with each exhale."
        ],
        "duration": 300,
        "animation_color": "from-secondary to-accent"
    },
    "sleep": {
        "title": "Sleep Meditation",
        "instructions": [
            "Lie down comfortably and close your eyes.",
            "Take a deep breath in for 4 counts...",
            "Hold for 2 counts...",
            "Exhale slowly for 6 counts...",
            "Feel your body sinking deeper into relaxation.",
            "With each breath, you drift closer to peaceful sleep."
        ],
        "duration": 300,
        "animation_color": "from-accent to-neutral"
    },
    "focus": {
        "title": "Focus Meditation",
        "instructions": [
            "Sit in a comfortable but alert position.",
            "Breathe in deeply, filling your lungs...",
            "Exhale completely, clearing your mind...",
            "Focus your attention on a single point.",
            "When distractions arise, acknowledge them and return your focus.",
            "Each breath sharpens your concentration."
        ],
        "duration": 300,
        "animation_color": "from-neutral to-primary"
    }
}

app = FastAPI(title="Guided Meditation App")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Set up templates
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def get_home(request: Request):
    print(colored("Serving home page", "green"))
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/api/meditations", response_class=JSONResponse)
async def get_all_meditations():
    """Get all available meditation types"""
    try:
        print(colored("Fetching all meditation types", "cyan"))
        return MEDITATIONS
    except Exception as e:
        print(colored(f"Error fetching meditations: {str(e)}", "red"))
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/meditations/{meditation_type}", response_class=JSONResponse)
async def get_meditation(meditation_type: str):
    """Get a specific meditation by type"""
    try:
        print(colored(f"Fetching meditation type: {meditation_type}", "cyan"))
        if meditation_type not in MEDITATIONS:
            print(colored(f"Meditation type not found: {meditation_type}", "yellow"))
            raise HTTPException(status_code=404, detail="Meditation type not found")
        return MEDITATIONS[meditation_type]
    except HTTPException:
        raise
    except Exception as e:
        print(colored(f"Error fetching meditation: {str(e)}", "red"))
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
