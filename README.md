# Morning News

An AI-generated morning news streaming platform with a clean web interface for listening to daily news briefings, browsing past episodes, and staying connected with subscribers.

## Features

### 🎙️ Current Episode Player
- Stream today's AI-generated news episode directly in your browser
- Clean, modern audio player interface
- Episode metadata with title, description, and tags

### 📚 Episode Archive
- Browse all past episodes in an organized grid layout
- Beautiful card-based UI for easy navigation
- Click any episode to play it in a modal player

### 🔍 Advanced Search & Filtering
- Full-text search across episode titles, descriptions, and tags
- Tag-based filtering with one-click tag selection
- Instant results with responsive search

### 📧 Subscriber Management
- Email subscription system for follower notifications
- Social media integration (Twitter/X, Instagram, YouTube)
- Subscriber data stored securely in JSON format

### 📱 Responsive Design
- Mobile-first responsive layout
- Works seamlessly on desktop, tablet, and mobile devices
- Clean, professional UI with modern design principles

## Tech Stack

- **Backend**: Node.js with Express
- **Frontend**: Vanilla HTML/CSS/JavaScript (no framework dependencies)
- **Storage**: JSON-based file storage
- **Audio**: HTML5 audio player with MP3 support

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd MorningNews
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Project Structure

```
MorningNews/
├── server.js              # Express server and API endpoints
├── package.json           # Node.js dependencies
├── public/                # Frontend files
│   ├── index.html        # Main HTML page
│   ├── styles.css        # CSS styling
│   └── app.js            # Frontend JavaScript
├── audio/                 # Audio files directory
│   └── .gitkeep
├── data/                  # Data storage
│   ├── episodes.json     # Episode metadata
│   └── subscribers.json  # Subscriber information
└── README.md             # This file
```

## API Endpoints

### Episodes

- `GET /api/episodes` - Get all episodes
- `GET /api/episodes/current` - Get today's episode
- `GET /api/episodes/search?q=query` - Search episodes by text
- `GET /api/episodes/search?tag=tagname` - Filter episodes by tag
- `POST /api/episodes` - Create new episode (admin)

### Tags

- `GET /api/tags` - Get all unique tags

### Subscriptions

- `POST /api/subscribe` - Subscribe with email and social links

## Adding New Episodes

### Option 1: Via API

Send a POST request to `/api/episodes`:

```bash
curl -X POST http://localhost:3000/api/episodes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Your Episode Title",
    "description": "Episode description",
    "audioFile": "filename.mp3",
    "tags": ["Tag1", "Tag2"],
    "date": "2026-01-13"
  }'
```

### Option 2: Manual Edit

1. Place your audio file in the `audio/` directory
2. Edit `data/episodes.json` and add your episode:

```json
{
  "id": "unique-id",
  "title": "Episode Title",
  "description": "Episode description",
  "audioFile": "your-audio-file.mp3",
  "tags": ["Tag1", "Tag2"],
  "date": "2026-01-13",
  "createdAt": "2026-01-13T06:00:00.000Z"
}
```

## Audio File Requirements

- **Format**: MP3 (recommended)
- **Location**: Place files in the `audio/` directory
- **Naming**: Use descriptive names (e.g., `2026-01-13-morning-news.mp3`)
- **Reference**: Use the filename in the episode metadata

## Customization

### Branding
- Edit the logo and title in `public/index.html`
- Modify colors in `public/styles.css` (see `:root` CSS variables)

### Styling
Key CSS variables in `styles.css`:
```css
:root {
  --primary-color: #2563eb;    /* Main brand color */
  --secondary-color: #1e40af;  /* Secondary brand color */
  --accent-color: #f59e0b;     /* Accent highlights */
}
```

## Future Enhancements

Consider adding:
- **User Authentication**: Admin panel for episode management
- **Analytics Dashboard**: Track listener statistics and popular episodes
- **RSS Feed**: Allow podcast apps to subscribe
- **Audio Generation Integration**: Directly integrate with AI text-to-speech APIs
- **News Source Integration**: Automatically fetch and summarize news from APIs
- **Playlist Feature**: Allow users to create custom episode playlists
- **Download Option**: Let users download episodes for offline listening
- **Comments Section**: Enable listener feedback and discussions
- **Transcripts**: Auto-generate and display episode transcripts
- **Email Automation**: Send automated emails when new episodes are released

## Production Deployment

For production deployment, consider:

1. **Environment Variables**: Use `.env` file for configuration
2. **Database**: Migrate from JSON to PostgreSQL/MongoDB for scalability
3. **Cloud Storage**: Store audio files in S3 or similar service
4. **CDN**: Use a CDN for faster audio delivery
5. **HTTPS**: Enable SSL/TLS encryption
6. **Process Manager**: Use PM2 to keep the server running
7. **Reverse Proxy**: Use Nginx or Apache for better performance

## License

MIT License - Feel free to use and modify for your needs.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Support

For questions or issues, please open an issue on GitHub or contact the maintainer.