const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));
app.use('/audio', express.static('audio'));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Initialize episodes data file
const episodesFile = path.join(dataDir, 'episodes.json');
if (!fs.existsSync(episodesFile)) {
  fs.writeFileSync(episodesFile, JSON.stringify([], null, 2));
}

// Initialize subscribers data file
const subscribersFile = path.join(dataDir, 'subscribers.json');
if (!fs.existsSync(subscribersFile)) {
  fs.writeFileSync(subscribersFile, JSON.stringify([], null, 2));
}

// Helper functions
function readEpisodes() {
  const data = fs.readFileSync(episodesFile, 'utf8');
  return JSON.parse(data);
}

function writeEpisodes(episodes) {
  fs.writeFileSync(episodesFile, JSON.stringify(episodes, null, 2));
}

function readSubscribers() {
  const data = fs.readFileSync(subscribersFile, 'utf8');
  return JSON.parse(data);
}

function writeSubscribers(subscribers) {
  fs.writeFileSync(subscribersFile, JSON.stringify(subscribers, null, 2));
}

// API Routes

// Get all episodes
app.get('/api/episodes', (req, res) => {
  try {
    const episodes = readEpisodes();
    res.json(episodes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch episodes' });
  }
});

// Get current episode (today's episode)
app.get('/api/episodes/current', (req, res) => {
  try {
    const episodes = readEpisodes();
    const today = new Date().toISOString().split('T')[0];
    const currentEpisode = episodes.find(ep => ep.date === today);

    if (currentEpisode) {
      res.json(currentEpisode);
    } else {
      res.status(404).json({ message: 'No episode for today yet' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch current episode' });
  }
});

// Search episodes by tag or content
app.get('/api/episodes/search', (req, res) => {
  try {
    const { q, tag } = req.query;
    let episodes = readEpisodes();

    if (tag) {
      episodes = episodes.filter(ep =>
        ep.tags && ep.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
      );
    }

    if (q) {
      const query = q.toLowerCase();
      episodes = episodes.filter(ep =>
        ep.title.toLowerCase().includes(query) ||
        ep.description.toLowerCase().includes(query) ||
        (ep.tags && ep.tags.some(t => t.toLowerCase().includes(query)))
      );
    }

    res.json(episodes);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// Add new episode (for admin/content generation)
app.post('/api/episodes', (req, res) => {
  try {
    const { title, description, audioFile, tags, date } = req.body;

    if (!title || !audioFile) {
      return res.status(400).json({ error: 'Title and audio file are required' });
    }

    const episodes = readEpisodes();
    const newEpisode = {
      id: Date.now().toString(),
      title,
      description: description || '',
      audioFile,
      tags: tags || [],
      date: date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    episodes.unshift(newEpisode);
    writeEpisodes(episodes);

    res.status(201).json(newEpisode);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create episode' });
  }
});

// Subscribe to newsletter
app.post('/api/subscribe', (req, res) => {
  try {
    const { email, name, socials } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const subscribers = readSubscribers();

    // Check if already subscribed
    if (subscribers.some(sub => sub.email === email)) {
      return res.status(409).json({ error: 'Email already subscribed' });
    }

    const newSubscriber = {
      id: Date.now().toString(),
      email,
      name: name || '',
      socials: socials || {},
      subscribedAt: new Date().toISOString()
    };

    subscribers.push(newSubscriber);
    writeSubscribers(subscribers);

    res.status(201).json({ message: 'Successfully subscribed!', subscriber: newSubscriber });
  } catch (error) {
    res.status(500).json({ error: 'Subscription failed' });
  }
});

// Get all tags
app.get('/api/tags', (req, res) => {
  try {
    const episodes = readEpisodes();
    const tagsSet = new Set();

    episodes.forEach(ep => {
      if (ep.tags) {
        ep.tags.forEach(tag => tagsSet.add(tag));
      }
    });

    res.json(Array.from(tagsSet).sort());
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🎙️  Morning News server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});
