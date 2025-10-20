document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  // Helper: create a participant <li> with delete handler and append to activityCard
  function createParticipantItem(activityName, participantEmail, activityCard) {
    let participantsList = activityCard.querySelector('.participants-list');
    // Defensive: if the list doesn't exist yet, create and append it so this helper is safe to call
    if (!participantsList) {
      participantsList = document.createElement('ul');
      participantsList.className = 'participants-list';
      activityCard.appendChild(participantsList);
    }

    const li = document.createElement('li');
    li.className = 'participant-item';
    li.dataset.email = participantEmail;

    const span = document.createElement('span');
    span.textContent = participantEmail;

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-participant';
    delBtn.title = 'Remove participant';
    delBtn.innerHTML = '&times;';

    delBtn.addEventListener('click', async () => {
      try {
        const res = await fetch(
          `/activities/${encodeURIComponent(activityName)}/participants?email=${encodeURIComponent(participantEmail)}`,
          { method: 'DELETE' }
        );

        const result = await res.json();
        if (res.ok) {
          // remove from DOM
          li.remove();
          // update availability text
          const avail = activityCard.querySelector('.availability');
          if (avail) {
            const max = parseInt(activityCard.dataset.maxParticipants, 10) || 0;
            const current = activityCard.querySelectorAll('.participant-item').length;
            const newSpots = max - current;
            avail.innerHTML = `<strong>Availability:</strong> ${newSpots} spots left`;
          }
        } else {
          alert(result.detail || 'Failed to remove participant');
        }
      } catch (err) {
        console.error('Error removing participant:', err);
        alert('Failed to remove participant');
      }
    });

    li.appendChild(span);
    li.appendChild(delBtn);
    participantsList.appendChild(li);
  }

  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
  const activityCard = document.createElement("div");
  activityCard.className = "activity-card";
  // mark the card with the activity name and max participants for later updates
  activityCard.dataset.activity = name;
  activityCard.dataset.maxParticipants = details.max_participants;

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p class="availability"><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <h5>Participants</h5>
        `;

        // Create participants list and append it, then populate items
        const participantsList = document.createElement("ul");
        participantsList.className = "participants-list";
        activityCard.appendChild(participantsList);
        details.participants.forEach((p) => {
          createParticipantItem(name, p, activityCard);
        });

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Update the UI immediately: append participant to corresponding activity card
        try {
          const activityCards = document.querySelectorAll('.activity-card');
          let targetCard = null;
          activityCards.forEach((card) => {
            if (card.dataset.activity === activity) targetCard = card;
          });

          if (targetCard) {
            // create and append new participant item
            createParticipantItem(activity, email, targetCard);

            // update availability
            const max = parseInt(targetCard.dataset.maxParticipants, 10) || 0;
            const current = targetCard.querySelectorAll('.participant-item').length;
            const newSpots = max - current;
            const avail = targetCard.querySelector('.availability');
            if (avail) {
              avail.innerHTML = `<strong>Availability:</strong> ${newSpots} spots left`;
            }
          }
        } catch (err) {
          console.error('Error updating UI after signup:', err);
        }
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
