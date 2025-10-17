"""
High School Management System API

A super simple FastAPI application that allows students to view and sign up
for extracurricular activities at Mergington High School.
"""

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
import os
from pathlib import Path

app = FastAPI(title="Mergington High School API",
              description="API for viewing and signing up for extracurricular activities")

# Mount the static files directory
current_dir = Path(__file__).parent
app.mount("/static", StaticFiles(directory=os.path.join(Path(__file__).parent,
          "static")), name="static")

# In-memory activity database
activities = {
    "Chess Club": {
        "description": "Learn strategies and compete in chess tournaments",
        "schedule": "Fridays, 3:30 PM - 5:00 PM",
        "max_participants": 12,
        "participants": ["michael@mergington.edu", "daniel@mergington.edu"]
    },
    "Programming Class": {
        "description": "Learn programming fundamentals and build software projects",
        "schedule": "Tuesdays and Thursdays, 3:30 PM - 4:30 PM",
        "max_participants": 20,
        "participants": ["emma@mergington.edu", "sophia@mergington.edu"]
    },
    "Gym Class": {
        "description": "Physical education and sports activities",
        "schedule": "Mondays, Wednesdays, Fridays, 2:00 PM - 3:00 PM",
        "max_participants": 30,
        "participants": ["john@mergington.edu", "olivia@mergington.edu"]
    },
    "Soccer Team": {
        "description": "Competitive soccer training and interschool matches",
        "schedule": "Mondays and Thursdays, 4:00 PM - 6:00 PM",
        "max_participants": 22,
        "participants": ["liam@mergington.edu", "mia.k@mergington.edu"]
    },
    "Basketball Club": {
        "description": "Skill development, practice, and pickup games",
        "schedule": "Wednesdays, 5:00 PM - 7:00 PM",
        "max_participants": 16,
        "participants": ["noah@mergington.edu", "ava@mergington.edu"]
    },
    "Drama Club": {
        "description": "Acting, stagecraft, and school theatrical productions",
        "schedule": "Tuesdays, 6:00 PM - 8:00 PM",
        "max_participants": 25,
        "participants": ["oliver@mergington.edu", "isabella@mergington.edu"]
    },
    "Art Workshop": {
        "description": "Drawing, painting, and mixed-media projects",
        "schedule": "Fridays, 3:30 PM - 5:00 PM",
        "max_participants": 20,
        "participants": ["charlotte@mergington.edu", "amelia@mergington.edu"]
    },
    "Debate Team": {
        "description": "Prepare for debates, practice public speaking and argumentation",
        "schedule": "Thursdays, 5:00 PM - 6:30 PM",
        "max_participants": 18,
        "participants": ["ethan@mergington.edu", "harper@mergington.edu"]
    },
    "Math Club": {
        "description": "Problem solving, math contests, and enrichment",
        "schedule": "Mondays, 3:30 PM - 4:30 PM",
        "max_participants": 20,
        "participants": ["aiden@mergington.edu", "zoe@mergington.edu"]
    }
}


@app.get("/")
def root():
    return RedirectResponse(url="/static/index.html")


@app.get("/activities")
def get_activities():
    return activities


@app.post("/activities/{activity_name}/signup")
def signup_for_activity(activity_name: str, email: str):

    """Sign up a student for an activity"""
    # Validate activity exists
    if activity_name not in activities:
        raise HTTPException(status_code=404, detail="Activity not found")

    # Get the specific activity
    activity = activities[activity_name]

    # Validate student is not already signed up
    for activity in activities.values():
        if email in activity["participants"]:
            raise HTTPException(status_code=400, detail="Student already signed up for an activity")    

    # Add student
    activity["participants"].append(email)
    return {"message": f"Signed up {email} for {activity_name}"}
