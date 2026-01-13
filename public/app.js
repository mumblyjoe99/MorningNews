// API Base URL
const API_BASE = window.location.origin;

// State
let allEpisodes = [];
let allTags = [];
let activeTag = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadCurrentEpisode();
  loadAllEpisodes();
  loadTags();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  // Search
  document.getElementById('search-btn').addEventListener('click', handleSearch);
  document.getElementById('clear-search-btn').addEventListener('click', clearSearch);
  document.getElementById('search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

  // Subscribe form
  document.getElementById('subscribe-form').addEventListener('submit', handleSubscribe);

  // Modal close
  document.querySelector('.modal-close').addEventListener('click', closeModal);
  document.getElementById('player-modal').addEventListener('click', (e) => {
    if (e.target.id === 'player-modal') closeModal();
  });
}

// Load current episode
async function loadCurrentEpisode() {
  const container = document.getElementById('current-episode-container');

  try {
    const response = await fetch(`${API_BASE}/api/episodes/current`);

    if (response.ok) {
      const episode = await response.json();
      container.innerHTML = createAudioPlayer(episode);
    } else {
      container.innerHTML = `
        <div class="no-episodes">
          <h3>No Episode Yet Today</h3>
          <p>Check back later for today's AI-generated news briefing!</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading current episode:', error);
    container.innerHTML = `
      <div class="no-episodes">
        <h3>Error Loading Episode</h3>
        <p>Please try refreshing the page.</p>
      </div>
    `;
  }
}

// Load all episodes
async function loadAllEpisodes() {
  try {
    const response = await fetch(`${API_BASE}/api/episodes`);
    allEpisodes = await response.json();
    displayEpisodes(allEpisodes);
  } catch (error) {
    console.error('Error loading episodes:', error);
    document.getElementById('episodes-grid').innerHTML = `
      <div class="no-episodes">
        <h3>Error Loading Episodes</h3>
        <p>Please try refreshing the page.</p>
      </div>
    `;
  }
}

// Load tags
async function loadTags() {
  try {
    const response = await fetch(`${API_BASE}/api/tags`);
    allTags = await response.json();
    displayTagButtons();
  } catch (error) {
    console.error('Error loading tags:', error);
  }
}

// Display tag filter buttons
function displayTagButtons() {
  const container = document.getElementById('tag-buttons');

  if (allTags.length === 0) {
    container.innerHTML = '<span style="color: var(--text-secondary);">No tags yet</span>';
    return;
  }

  container.innerHTML = allTags.map(tag => `
    <span class="tag-btn" data-tag="${tag}">${tag}</span>
  `).join('');

  // Add click handlers
  container.querySelectorAll('.tag-btn').forEach(btn => {
    btn.addEventListener('click', () => handleTagFilter(btn.dataset.tag));
  });
}

// Handle tag filter
function handleTagFilter(tag) {
  if (activeTag === tag) {
    // Deselect
    activeTag = null;
    document.querySelectorAll('.tag-btn').forEach(btn => btn.classList.remove('active'));
    displayEpisodes(allEpisodes);
  } else {
    // Select new tag
    activeTag = tag;
    document.querySelectorAll('.tag-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tag === tag);
    });

    const filtered = allEpisodes.filter(ep =>
      ep.tags && ep.tags.includes(tag)
    );
    displayEpisodes(filtered);
  }
}

// Handle search
async function handleSearch() {
  const query = document.getElementById('search-input').value.trim();

  if (!query) {
    displayEpisodes(allEpisodes);
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/episodes/search?q=${encodeURIComponent(query)}`);
    const results = await response.json();
    displayEpisodes(results);
  } catch (error) {
    console.error('Search error:', error);
  }
}

// Clear search
function clearSearch() {
  document.getElementById('search-input').value = '';
  activeTag = null;
  document.querySelectorAll('.tag-btn').forEach(btn => btn.classList.remove('active'));
  displayEpisodes(allEpisodes);
}

// Display episodes
function displayEpisodes(episodes) {
  const grid = document.getElementById('episodes-grid');

  if (episodes.length === 0) {
    grid.innerHTML = `
      <div class="no-episodes">
        <h3>No Episodes Found</h3>
        <p>Try adjusting your search or check back later for new content.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = episodes.map(episode => `
    <div class="episode-card" data-episode-id="${episode.id}">
      <h3>${escapeHtml(episode.title)}</h3>
      <div class="episode-date">${formatDate(episode.date)}</div>
      <p class="episode-description">${escapeHtml(episode.description)}</p>
      ${episode.tags && episode.tags.length > 0 ? `
        <div class="episode-tags">
          ${episode.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
      ` : ''}
      <button class="play-button" onclick="playEpisodeInModal('${episode.id}')">
        ▶ Play Episode
      </button>
    </div>
  `).join('');
}

// Create audio player HTML
function createAudioPlayer(episode) {
  return `
    <div class="audio-player">
      <div class="episode-info">
        <h3>${escapeHtml(episode.title)}</h3>
        <div class="episode-date">${formatDate(episode.date)}</div>
        <p class="episode-description">${escapeHtml(episode.description)}</p>
        ${episode.tags && episode.tags.length > 0 ? `
          <div class="episode-tags">
            ${episode.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
          </div>
        ` : ''}
      </div>
      <div class="player-controls">
        <audio controls>
          <source src="${API_BASE}/audio/${episode.audioFile}" type="audio/mpeg">
          Your browser does not support the audio element.
        </audio>
      </div>
    </div>
  `;
}

// Play episode in modal
function playEpisodeInModal(episodeId) {
  const episode = allEpisodes.find(ep => ep.id === episodeId);

  if (!episode) return;

  const modal = document.getElementById('player-modal');
  const container = document.getElementById('modal-player-container');

  container.innerHTML = createAudioPlayer(episode);
  modal.classList.add('show');
}

// Close modal
function closeModal() {
  const modal = document.getElementById('player-modal');
  const container = document.getElementById('modal-player-container');

  modal.classList.remove('show');

  // Stop audio if playing
  const audio = container.querySelector('audio');
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }

  container.innerHTML = '';
}

// Handle subscribe
async function handleSubscribe(e) {
  e.preventDefault();

  const messageEl = document.getElementById('subscribe-message');
  const submitBtn = e.target.querySelector('button[type="submit"]');

  const data = {
    name: document.getElementById('sub-name').value.trim(),
    email: document.getElementById('sub-email').value.trim(),
    socials: {
      twitter: document.getElementById('sub-twitter').value.trim(),
      instagram: document.getElementById('sub-instagram').value.trim(),
      youtube: document.getElementById('sub-youtube').value.trim()
    }
  };

  // Disable submit button
  submitBtn.disabled = true;
  submitBtn.textContent = 'Subscribing...';

  try {
    const response = await fetch(`${API_BASE}/api/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
      showMessage(messageEl, result.message, 'success');
      e.target.reset();
    } else {
      showMessage(messageEl, result.error || 'Subscription failed', 'error');
    }
  } catch (error) {
    console.error('Subscribe error:', error);
    showMessage(messageEl, 'Network error. Please try again.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Subscribe Now';
  }
}

// Show message
function showMessage(element, message, type) {
  element.textContent = message;
  element.className = `message ${type} show`;

  setTimeout(() => {
    element.classList.remove('show');
  }, 5000);
}

// Utility functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
