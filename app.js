let events = JSON.parse(localStorage.getItem('events')) || [];

// Theme toggle logic
const toggleBtn = document.getElementById('toggleTheme');
const body = document.body;

if (localStorage.getItem('theme') === 'dark') {
  body.classList.add('dark');
  toggleBtn.textContent = '☀️ Light Mode';
}

toggleBtn.addEventListener('click', () => {
  body.classList.toggle('dark');
  const isDark = body.classList.contains('dark');
  toggleBtn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// Event creation
document.getElementById('eventForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const date = document.getElementById('date').value;
  const invitees = document.getElementById('invitees').value.split(',').map(i => i.trim());

  const event = {
    id: Date.now(),
    title,
    description,
    date,
    invitees,
    rsvps: {},
    alarmSet: false
  };

  events.push(event);
  localStorage.setItem('events', JSON.stringify(events));
  renderEvents();
  this.reset();
});

// Render events
function renderEvents(filter = '') {
  const list = document.getElementById('eventList');
  list.innerHTML = '';

  events
    .filter(ev => ev.title.toLowerCase().includes(filter.toLowerCase()))
    .forEach(ev => {
      const card = document.createElement('div');
      card.className = 'col';

      card.innerHTML = `
        <div class="glass-card p-3 h-100">
          <div class="card-body">
            <h5 class="card-title">${ev.title}</h5>
            <p class="card-text">${ev.description}</p>
            <p><strong>Date:</strong> ${new Date(ev.date).toLocaleString()}</p>
            <p><strong>Invitees:</strong> ${ev.invitees.join(', ')}</p>
            <div class="mt-2">
              ${ev.invitees.map(email => `
                <button onclick="rsvp('${ev.id}', '${email}')" class="btn btn-sm btn-outline-success m-1">
                  RSVP: ${ev.rsvps[email] || 'Pending'} (${email})
                </button>
              `).join('')}
            </div>
          </div>
          <div class="card-footer d-flex justify-content-between">
            <button onclick="setAlarm('${ev.id}')" class="btn btn-warning btn-sm">Set Alarm</button>
            <button onclick="deleteEvent('${ev.id}')" class="btn btn-danger btn-sm">Delete</button>
          </div>
        </div>
      `;
      list.appendChild(card);
    });
}

// RSVP toggle
function rsvp(eventId, email) {
  const event = events.find(ev => ev.id == eventId);
  event.rsvps[email] = event.rsvps[email] === 'Yes' ? 'No' : 'Yes';
  localStorage.setItem('events', JSON.stringify(events));
  renderEvents(document.getElementById('search').value);
}

// Delete event
function deleteEvent(id) {
  events = events.filter(ev => ev.id != id);
  localStorage.setItem('events', JSON.stringify(events));
  renderEvents();
}

// Alarm system
function setAlarm(id) {
  const event = events.find(ev => ev.id == id);
  if (event.alarmSet) return alert('Alarm already set!');
  const delay = new Date(event.date) - new Date();
  if (delay < 0) return alert('Event already passed!');
  setTimeout(() => {
    alert(`⏰ Reminder: ${event.title} is happening now!`);
  }, delay);
  event.alarmSet = true;
  localStorage.setItem('events', JSON.stringify(events));
}

// Search
document.getElementById('search').addEventListener('input', function () {
  renderEvents(this.value);
});
renderEvents();
async function sendInvite(email, eventTitle) {
  await fetch('http://localhost:5000/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: "snigdhasaha.student@gmail.com",
      subject: `You're invited to: ${eventTitle}`,
      text: `Hi! You've been invited to the event "${eventTitle}".`
    })
  });
}