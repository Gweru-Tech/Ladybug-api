# Anime & Media API v7 by Ntando Mods ✔️

![Version](https://img.shields.io/badge/version-7.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![APIs](https://img.shields.io/badge/apis-30%2B-red.svg)

🚀 **A comprehensive API collection with 30+ free endpoints** for Anime, YouTube, AI, Images, and much more! Perfect for developers and hobbyists looking for a powerful, free API solution.

## ✨ Features

- 🎬 **YouTube APIs**: Search, Download, Convert to MP4/MP3
- 🎌 **Anime APIs**: Search, Info, Episodes, Characters, Random
- 🤖 **AI APIs**: Chat, Image Generation, Text Processing
- 🖼️ **Image APIs**: Lyrics Images, Background Removal, Filters, Meme Generator
- 🛠️ **Utility APIs**: Weather, URL Shortener, QR Code, Validators
- 📱 **Social APIs**: Instagram, TikTok, Twitter Profile Info
- 📝 **Text APIs**: Translation, Summarization, Analysis, Sentiment
- 📁 **File APIs**: PDF Extraction, Image Conversion, HTML Conversion
- 🎭 **Entertainment**: Random Jokes, Quotes, News

## 🌟 Highlights

- **30+ Free API Endpoints**
- **Real-time Status Monitoring**
- **Built-in Rate Limiting**
- **Smart Caching System**
- **Beautiful Interactive Dashboard**
- **Dark/Light Theme Toggle**
- **Fully Responsive Design**
- **RESTful API Architecture**
- **Detailed Documentation**
- **Production Ready**
- **Multi-Platform Deployment**

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/ntandomods/anime-media-api-v7.git
cd anime-media-api-v7

# Install dependencies
npm install

# Start the server
npm start
```

### Local Development

```bash
# For development with auto-reload
npm run dev
```

Visit `http://localhost:3000` to access the interactive API dashboard.

## 📡 API Endpoints

### 🎬 YouTube APIs
- `GET /api/ytsearch` - Search YouTube videos
- `GET /api/ytdl` - Download YouTube videos
- `GET /api/ytmp4` - Convert YouTube to MP4
- `GET /api/ytmp3` - Convert YouTube to MP3

### 🎌 Anime APIs
- `GET /api/anime/search` - Search anime
- `GET /api/anime/info` - Get anime details
- `GET /api/anime/episodes` - Get episode list
- `GET /api/anime/characters` - Get character list
- `GET /api/anime/random` - Get random anime

### 🤖 AI APIs
- `POST /api/ai/chat` - Chat with AI
- `POST /api/ai/image` - Generate AI images
- `POST /api/ai/text` - Process text with AI

### 🖼️ Image APIs
- `GET /api/image/lyrics` - Create lyrics images
- `POST /api/image/bgremove` - Remove image background
- `GET /api/image/resize` - Resize images
- `GET /api/image/filters` - Apply image filters
- `GET /api/image/meme` - Generate memes

### 🛠️ Utility APIs
- `GET /api/weather` - Get weather information
- `GET /api/shorten` - Shorten URLs
- `GET /api/expand` - Expand short URLs
- `GET /api/qr` - Generate QR codes
- `POST /api/validate/email` - Validate email addresses
- `POST /api/validate/password` - Check password strength

### 📱 Social Media APIs
- `GET /api/social/instagram` - Get Instagram profile info
- `GET /api/social/tiktok` - Get TikTok profile info
- `GET /api/social/twitter` - Get Twitter profile info

### 📝 Text Processing APIs
- `POST /api/text/translate` - Translate text
- `POST /api/text/summarize` - Summarize text
- `POST /api/text/analyze` - Analyze text
- `POST /api/text/sentiment` - Analyze sentiment

### 📁 File APIs
- `POST /api/pdf/extract` - Extract PDF text
- `POST /api/convert/image` - Convert image formats
- `POST /api/convert/html` - Convert to HTML

### 🎭 Entertainment APIs
- `GET /api/jokes/random` - Get random jokes
- `GET /api/quotes/random` - Get random quotes
- `GET /api/news/random` - Get random news

### 📊 System APIs
- `GET /api/status` - Get API status and stats
- `GET /api/health` - Health check endpoint

## 🌐 Deployment

### 🟦 Render.com

1. Fork this repository
2. Connect your GitHub account to Render
3. Create a new Web Service
4. Select the forked repository
5. Use the `render.yaml` configuration file
6. Deploy! 🚀

### 🟨 Vercel

1. Fork this repository
2. Install Vercel CLI: `npm i -g vercel`
3. Run: `vercel`
4. Follow the prompts
5. Deploy! 🚀

### 🐳 Docker

```bash
# Build the image
docker build -t anime-media-api-v7 .

# Run the container
docker run -p 3000:3000 anime-media-api-v7
```

### 🐙 Docker Compose

```bash
# Start with Docker Compose
docker-compose up -d
```

### 🟢 Railway

1. Fork this repository
2. Connect Railway to your GitHub
3. Select the repository
4. Deploy! 🚀

### 🔵 Heroku

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set buildpack
heroku buildpacks:set heroku/nodejs

# Deploy
git push heroku main
```

## 📖 API Usage Examples

### YouTube Search
```bash
curl "http://localhost:3000/api/ytsearch?q=anime%20music&limit=5"
```

### Anime Search
```bash
curl "http://localhost:3000/api/anime/search?q=naruto&limit=3"
```

### AI Chat
```bash
curl -X POST "http://localhost:3000/api/ai/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?"}'
```

### Weather Info
```bash
curl "http://localhost:3000/api/weather?city=Tokyo"
```

## 🔧 Configuration

Copy `.env.example` to `.env` and configure your environment variables:

```bash
cp .env.example .env
```

## 📊 Response Format

All API responses follow this format:

```json
{
  "status": "success|error",
  "message": "Response message",
  "data": {},
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600
}
```

## 🛡️ Security Features

- ⚡ Rate Limiting (100 requests per minute)
- 🛡️ Helmet.js Security Headers
- 🌐 CORS Configuration
- 📝 Input Validation
- 🔒 Safe Error Handling

## 📈 Monitoring

- ✅ Real-time API Status
- ⏰ Uptime Tracking
- 📊 Request Counter
- ⚡ Latency Monitoring
- 💾 Cache Statistics
- 🖥️ Memory Usage

## 🎨 Features

- 🌙 Dark/Light Theme Toggle
- 📱 Fully Responsive Design
- 🔍 API Search Functionality
- 🏷️ Category Filtering
- 🧪 Interactive API Tester
- 📖 Built-in Documentation
- 🚀 One-click API Testing

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Jikan API for anime data
- OpenAI for AI capabilities
- All contributors and users!

## 📞 Support

If you need help or have any questions:

- 📧 Email: support@ntandomods.com
- 💬 Discord: Join our community
- 🐛 Issues: Open an issue on GitHub

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=ntandomods/anime-media-api-v7&type=Date)](https://star-history.com/#ntandomods/anime-media-api-v7&Date)

---

**Made with ❤️ by Ntando Mods ✔️**

If this project helped you, please consider giving it a ⭐ star!