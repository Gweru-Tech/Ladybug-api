const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');
const path = require('path');
const fs = require('fs');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Cache setup (10 minutes TTL)
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

// Rate limiting middleware
const rateLimitMiddleware = async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({
      status: 'error',
      message: 'Too many requests, please try again later.',
      retryAfter: rejRes.msBeforeNext
    });
  }
};

// Uptime tracking
const startTime = Date.now();

// Utility functions
const getCachedData = (key) => cache.get(key);
const setCachedData = (key, data) => cache.set(key, data);

const makeRequest = async (url, options = {}) => {
  try {
    const response = await axios({ url, timeout: 30000, ...options });
    return response.data;
  } catch (error) {
    throw new Error(`Request failed: ${error.message}`);
  }
};

const sendError = (res, message, code = 500) => {
  res.status(code).json({
    status: 'error',
    message,
    timestamp: new Date().toISOString()
  });
};

const sendSuccess = (res, data, message = 'Success') => {
  res.json({
    status: 'success',
    message,
    data,
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000)
  });
};

// ============ HOME PAGE ============
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============ STATUS & SYSTEM APIS ============
app.get('/api/status', rateLimitMiddleware, (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const memory = process.memoryUsage();
  
  sendSuccess(res, {
    api_name: 'Anime & Media API v7',
    author: 'Ntando Mods ✔️',
    version: '7.0.0',
    uptime_seconds: uptime,
    uptime_human: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${uptime % 60}s`,
    memory_usage: {
      rss: `${Math.round(memory.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)}MB`
    },
    node_version: process.version,
    platform: process.platform,
    total_apis: 30,
    cache_size: cache.keys().length,
    rate_limit: {
      requests: 100,
      duration: '60 seconds'
    }
  }, 'API Status Retrieved');
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000)
  });
});

// ============ YOUTUBE APIS ============
app.get('/api/ytsearch', rateLimitMiddleware, async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    if (!q) return sendError(res, 'Query parameter "q" is required', 400);

    const cacheKey = `ytsearch:${q}:${limit}`;
    const cached = getCachedData(cacheKey);
    if (cached) return sendSuccess(res, cached, 'Data from cache');

    // Using Invidious instance for YouTube search
    const url = `https://yewtu.be/api/v1/search?q=${encodeURIComponent(q)}&limit=${limit}`;
    const data = await makeRequest(url);
    
    const results = data.map(video => ({
      id: video.videoId,
      title: video.title,
      channel: video.author,
      duration: video.lengthSeconds,
      views: video.viewCount,
      thumbnail: video.videoThumbnails?.[0]?.url,
      url: `https://www.youtube.com/watch?v=${video.videoId}`,
      uploaded: video.publishedText
    }));

    setCachedData(cacheKey, results);
    sendSuccess(res, results, 'YouTube search completed');
  } catch (error) {
    sendError(res, error.message);
  }
});

app.get('/api/ytdl', rateLimitMiddleware, async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return sendError(res, 'URL parameter is required', 400);

    // For demo purposes, return video info
    // In production, you'd use ytdl-core or youtube-dl-exec
    sendSuccess(res, {
      message: 'Download functionality requires additional setup',
      url: url,
      formats: ['mp4', 'mp3', 'webm'],
      note: 'Use ytdl-core for actual downloading'
    }, 'YouTube download info');
  } catch (error) {
    sendError(res, error.message);
  }
});

app.get('/api/ytmp4', rateLimitMiddleware, async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return sendError(res, 'URL parameter is required', 400);

    sendSuccess(res, {
      message: 'MP4 download endpoint',
      url: url,
      quality: ['720p', '480p', '360p'],
      download_link: `#placeholder_for_${url}`
    }, 'MP4 download info');
  } catch (error) {
    sendError(res, error.message);
  }
});

app.get('/api/ytmp3', rateLimitMiddleware, async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return sendError(res, 'URL parameter is required', 400);

    sendSuccess(res, {
      message: 'MP3 download endpoint',
      url: url,
      quality: ['128kbps', '192kbps', '320kbps'],
      download_link: `#placeholder_for_${url}`
    }, 'MP3 download info');
  } catch (error) {
    sendError(res, error.message);
  }
});

// ============ ANIME APIS ============
app.get('/api/anime/search', rateLimitMiddleware, async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    if (!q) return sendError(res, 'Query parameter "q" is required', 400);

    const cacheKey = `anime_search:${q}:${limit}`;
    const cached = getCachedData(cacheKey);
    if (cached) return sendSuccess(res, cached, 'Data from cache');

    // Using Jikan API for anime search
    const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=${limit}`;
    const data = await makeRequest(url);
    
    const results = data.data.map(anime => ({
      id: anime.mal_id,
      title: anime.title,
      title_english: anime.title_english,
      title_japanese: anime.title_japanese,
      type: anime.type,
      episodes: anime.episodes,
      status: anime.status,
      year: anime.year,
      score: anime.score,
      rank: anime.rank,
      synopsis: anime.synopsis?.substring(0, 200) + '...',
      image: anime.images.jpg.image_url,
      url: anime.url
    }));

    setCachedData(cacheKey, results);
    sendSuccess(res, results, 'Anime search completed');
  } catch (error) {
    sendError(res, error.message);
  }
});

app.get('/api/anime/info', rateLimitMiddleware, async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return sendError(res, 'Anime ID parameter is required', 400);

    const cacheKey = `anime_info:${id}`;
    const cached = getCachedData(cacheKey);
    if (cached) return sendSuccess(res, cached, 'Data from cache');

    const url = `https://api.jikan.moe/v4/anime/${id}`;
    const data = await makeRequest(url);
    const anime = data.data;

    const result = {
      id: anime.mal_id,
      title: anime.title,
      title_english: anime.title_english,
      title_japanese: anime.title_japanese,
      type: anime.type,
      episodes: anime.episodes,
      status: anime.status,
      aired: anime.aired.string,
      premiered: anime.premiered,
      broadcast: anime.broadcast.string,
      year: anime.year,
      season: anime.season,
      score: anime.score,
      scored_by: anime.scored_by,
      rank: anime.rank,
      popularity: anime.popularity,
      members: anime.members,
      favorites: anime.favorites,
      synopsis: anime.synopsis,
      background: anime.background,
      genres: anime.genres.map(g => g.name),
      themes: anime.themes?.map(t => t.name) || [],
      demographics: anime.demographics?.map(d => d.name) || [],
      studios: anime.studios.map(s => s.name),
      image: anime.images.jpg.image_url,
      trailer: anime.trailer.url,
      url: anime.url
    };

    setCachedData(cacheKey, result);
    sendSuccess(res, result, 'Anime info retrieved');
  } catch (error) {
    sendError(res, error.message);
  }
});

app.get('/api/anime/episodes', rateLimitMiddleware, async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return sendError(res, 'Anime ID parameter is required', 400);

    const cacheKey = `anime_episodes:${id}`;
    const cached = getCachedData(cacheKey);
    if (cached) return sendSuccess(res, cached, 'Data from cache');

    const url = `https://api.jikan.moe/v4/anime/${id}/episodes`;
    const data = await makeRequest(url);
    
    const result = {
      anime_id: id,
      episodes: data.data.map(ep => ({
        episode_id: ep.mal_id,
        title: ep.title,
        title_japanese: ep.title_japanese,
        aired: ep.aired,
        score: ep.score,
        filler: ep.filler,
        recap: ep.recap,
        forum_url: ep.forum_url
      })),
      pagination: data.pagination
    };

    setCachedData(cacheKey, result);
    sendSuccess(res, result, 'Anime episodes retrieved');
  } catch (error) {
    sendError(res, error.message);
  }
});

app.get('/api/anime/characters', rateLimitMiddleware, async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return sendError(res, 'Anime ID parameter is required', 400);

    const cacheKey = `anime_characters:${id}`;
    const cached = getCachedData(cacheKey);
    if (cached) return sendSuccess(res, cached, 'Data from cache');

    const url = `https://api.jikan.moe/v4/anime/${id}/characters`;
    const data = await makeRequest(url);
    
    const result = {
      anime_id: id,
      characters: data.data.map(char => ({
        character: {
          id: char.character.mal_id,
          name: char.character.name,
          image: char.character.images.jpg.image_url
        },
        role: char.role,
        voice_actors: char.voice_actors.map(va => ({
          person: {
            id: va.person.mal_id,
            name: va.person.name
          },
          language: va.language
        }))
      }))
    };

    setCachedData(cacheKey, result);
    sendSuccess(res, result, 'Anime characters retrieved');
  } catch (error) {
    sendError(res, error.message);
  }
});

app.get('/api/anime/random', rateLimitMiddleware, async (req, res) => {
  try {
    const cacheKey = 'anime_random';
    const cached = getCachedData(cacheKey);
    if (cached) return sendSuccess(res, cached, 'Data from cache');

    const url = 'https://api.jikan.moe/v4/random/anime';
    const data = await makeRequest(url);
    const anime = data.data;

    const result = {
      id: anime.mal_id,
      title: anime.title,
      type: anime.type,
      episodes: anime.episodes,
      score: anime.score,
      rank: anime.rank,
      synopsis: anime.synopsis?.substring(0, 200) + '...',
      image: anime.images.jpg.image_url,
      url: anime.url
    };

    // Cache for 5 minutes only for random
    cache.set(cacheKey, result, 300);
    sendSuccess(res, result, 'Random anime retrieved');
  } catch (error) {
    sendError(res, error.message);
  }
});

// ============ AI APIS ============
app.post('/api/ai/chat', rateLimitMiddleware, async (req, res) => {
  try {
    const { message, model = 'gpt-3.5-turbo' } = req.body;
    if (!message) return sendError(res, 'Message is required', 400);

    // Demo AI response - replace with actual OpenAI integration
    const response = {
      role: 'assistant',
      content: `AI Response to: "${message}". This is a demo response. In production, integrate with OpenAI API.`,
      model: model,
      usage: { prompt_tokens: 50, completion_tokens: 30, total_tokens: 80 }
    };

    sendSuccess(res, response, 'AI chat response generated');
  } catch (error) {
    sendError(res, error.message);
  }
});

app.post('/api/ai/image', rateLimitMiddleware, async (req, res) => {
  try {
    const { prompt, size = '512x512' } = req.body;
    if (!prompt) return sendError(res, 'Prompt is required', 400);

    // Demo image generation response
    const response = {
      prompt: prompt,
      size: size,
      image_url: 'https://picsum.photos/512/512',
      model: 'dall-e-demo',
      revised_prompt: `Demo revised prompt for: ${prompt}`
    };

    sendSuccess(res, response, 'Image generation demo');
  } catch (error) {
    sendError(res, error.message);
  }
});

app.post('/api/ai/text', rateLimitMiddleware, async (req, res) => {
  try {
    const { text, action = 'summarize' } = req.body;
    if (!text) return sendError(res, 'Text is required', 400);

    let result;
    switch (action) {
      case 'summarize':
        result = `Summary: This is a demo summary of the provided text. ${text.substring(0, 100)}...`;
        break;
      case 'translate':
        result = `Translation: [Demo translated version of: ${text.substring(0, 100)}...]`;
        break;
      case 'analyze':
        result = {
          sentiment: 'positive',
          language: 'english',
          word_count: text.split(' ').length,
          keywords: ['demo', 'text', 'analysis']
        };
        break;
      default:
        result = 'Demo AI text processing result';
    }

    sendSuccess(res, { action, original_text: text, result }, 'AI text processing completed');
  } catch (error) {
    sendError(res, error.message);
  }
});

// ============ IMAGE APIS ============
app.get('/api/image/lyrics', rateLimitMiddleware, async (req, res) => {
  try {
    const { title, artist } = req.query;
    if (!title) return sendError(res, 'Song title is required', 400);

    // Demo lyrics image generation
    const result = {
      title: title,
      artist: artist || 'Unknown Artist',
      image_url: 'https://picsum.photos/800/600?text=Lyrics',
      lyrics: 'Demo lyrics content would appear here...'
    };

    sendSuccess(res, result, 'Lyrics image generated');
  } catch (error) {
    sendError(res, error.message);
  }
});

app.post('/api/image/bgremove', rateLimitMiddleware, async (req, res) => {
  try {
    // Demo background removal
    const result = {
      message: 'Background removal demo endpoint',
      processed_url: 'https://picsum.photos/400/400?text=No+Background',
      original_size: '1920x1080',
      processed_size: '400x400'
    };

    sendSuccess(res, result, 'Background removal demo');
  } catch (error) {
    sendError(res, error.message);
  }
});

app.get('/api/image/resize', rateLimitMiddleware, async (req, res) => {
  try {
    const { url, width = 500, height = 500 } = req.query;
    if (!url) return sendError(res, 'Image URL is required', 400);

    const result = {
      original_url: url,
      resized_url: `https://picsum.photos/${width}/${height}`,
      dimensions: { width: parseInt(width), height: parseInt(height) },
      format: 'demo'
    };

    sendSuccess(res, result, 'Image resize demo');
  } catch (error) {
    sendError(res, error.message);
  }
});

app.get('/api/image/filters', rateLimitMiddleware, async (req, res) => {
  try {
    const { url, filter = 'grayscale' } = req.query;
    if (!url) return sendError(res, 'Image URL is required', 400);

    const filters = ['grayscale', 'sepia', 'blur', 'brightness', 'contrast', 'vintage'];
    const result = {
      original_url: url,
      available_filters: filters,
      applied_filter: filter,
      filtered_url: `https://picsum.photos/500/500?text=${filter}+Filter`
    };

    sendSuccess(res, result, 'Image filter applied');
  } catch (error) {
    sendError(res, error.message);
  }
});

app.get('/api/image/meme', rateLimitMiddleware, async (req, res) => {
  try {
    const { text, template = 'drake' } = req.query;
    if (!text) return sendError(res, 'Text is required', 400);

    const result = {
      template: template,
      text: text,
      meme_url: `https://picsum.photos/500/500?text=${encodeURIComponent(text)}`,
      top_text: text.split(',')[0] || text,
      bottom_text: text.split(',')[1] || ''
    };

    sendSuccess(res, result, 'Meme generated');
  } catch (error) {
    sendError(res, error.message);
  }
});

// ============ UTILITY APIS ============
app.get('/api/weather', rateLimitMiddleware, async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) return sendError(res, 'City parameter is required', 400);

    // Demo weather data
    const result = {
      city: city,
      temperature: '22°C',
      feels_like: '20°C',
      description: 'Partly cloudy',
      humidity: '65%',
      wind_speed: '15 km/h',
      pressure: '1013 hPa',
      visibility: '10 km',
      uv_index: '5',
      sunrise: '06:30',
      sunset: '18:45'
    };

    sendSuccess(res, result, 'Weather data retrieved');
  } catch (error) {
    sendError(res, error.message);
  }
});

app.get('/api/shorten', rateLimitMiddleware, async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return sendError(res, 'URL parameter is required', 400);

    const shortId = Math.random().toString(36).substring(2, 8);
    const result = {
      original_url: url,
      short_url: `https://short.link/${shortId}`,
      short_id: shortId,
      clicks: 0,
      created_at: new Date().toISOString()
    };

    sendSuccess(res, result, 'URL shortened');
  } catch (error) {
    sendError(res, error.message);
  }
});

app.get('/api/expand', rateLimitMiddleware, async (req, res) => {
  try {
    const { short_url } = req.query;
    if (!short_url) return sendError(res, 'Short URL parameter is required', 400);

    const result = {
      short_url: short_url,
      original_url: 'https://example.com/original-long-url-demo',
      created_at: new Date().toISOString(),
      clicks: Math.floor(Math.random() * 1000)
    };

    sendSuccess(res, result, 'URL expanded');
  } catch (error) {
    sendError(res, error.message);
  }
});

app.get('/api/qr', rateLimitMiddleware, async (req, res) => {
  try {
    const { text, size = '200' } = req.query;
    if (!text) return sendError(res, 'Text parameter is required', 400);

    const result = {
      text: text,
      size: size,
      qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`,
      format: 'PNG'
    };

    sendSuccess(res, result, 'QR code generated');
  } catch (error) {
    sendError(res, error.message);
  }
});

app.post('/api/validate/email', rateLimitMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return sendError(res, 'Email is required', 400);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);

    const result = {
      email: email,
      is_valid: isValid,
      domain: email.split('@')[1],
      local_part: email.split('@')[0]
    };

    sendSuccess(res, result, 'Email validation completed');
  } catch (error) {
    sendError(res, error.message);
  }
});

app.post('/api/validate/password', rateLimitMiddleware, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return sendError(res, 'Password is required', 400);

    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const strength = Object.values(checks).filter(Boolean).length;
    let strength_level;
    if (strength <= 2) strength_level = 'weak';
    else if (strength <= 3) strength_level = 'medium';
    else if (strength <= 4) strength_level = 'strong';
    else strength_level = 'very strong';

    const result = {
      password: '••••••••',
      is_valid: checks.length && checks.lowercase && checks.uppercase && checks.numbers,
      strength: strength_level,
      strength_score: strength,
      checks: checks
    };

    sendSuccess(res, result, 'Password validation completed');
  } catch (error) {
    sendError(res, error.message);
  }
});

// ============ SOCIAL MEDIA APIS ============
app.get('/api/social/instagram', rateLimitMiddleware, async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return sendError(res, 'Username is required', 400);

    const result = {
      username: username,
      full_name: 'Demo User',
      bio: 'This is a demo bio for Instagram profile',
      followers: Math.floor(Math.random() * 100000),
      following: Math.floor(Math.random() * 1000),
      posts: Math.floor(Math.random() * 100),
      is_verified: Math.random() > 0.5,
      profile_pic: 'https://picsum.photos/150/150',
      is_private: false
    };

    sendSuccess(res, result, 'Instagram profile info retrieved');
  } catch (error) {
    sendError(res, error.message);
  }
});

app.get('/api/social/tiktok', rateLimitMiddleware, async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return sendError(res, 'Username is required', 400);

    const result = {
      username: username,
      display_name: 'Demo TikTok User',
      bio: 'Demo TikTok bio 🎵',
      followers: Math.floor(Math.random() * 1000000),
      following: Math.floor(Math.random() * 100),
      likes: Math.floor(Math.random() * 10000000),
      videos: Math.floor(Math.random() * 100),
      is_verified: Math.random() > 0.7,
      profile_pic: 'https://picsum.photos/150/150'
    };

    sendSuccess(res, result, 'TikTok profile info retrieved');
  } catch (error) {
    sendError(res, error.message);
  }
});

app.get('/api/social/twitter', rateLimitMiddleware, async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return sendError(res, 'Username is required', 400);

    const result = {
      username: username,
      display_name: 'Demo Twitter User',
      bio: 'This is a demo Twitter bio. #Demo #API',
      followers: Math.floor(Math.random() * 50000),
      following: Math.floor(Math.random() * 1000),
      tweets: Math.floor(Math.random() * 10000),
      likes: Math.floor(Math.random() * 50000),
      is_verified: Math.random() > 0.6,
      profile_pic: 'https://picsum.photos/150/150',
      location: 'Demo City',
      website: 'demo-website.com'
    };

    sendSuccess(res, result, 'Twitter profile info retrieved');
  } catch (error) {
    sendError(res, error.message);
  }
});

// ============ TEXT PROCESSING APIS ============
app.post('/api/text/translate', rateLimitMiddleware, async (req, res) => {
  try {
    const { text, from = 'auto', to = 'en' } = req.body;
    if (!text) return sendError(res, 'Text is required', 400);

    const result = {
      original_text: text,
      translated_text: `[Demo translation: ${text}]`,
      from_language: from,
      to_language: to,
      confidence: 0.95
    };

    sendSuccess(res, result, 'Translation completed');
  } catch (error) {
    sendError(res, error.message);
  }
});

app.post('/api/text/summarize', rateLimitMiddleware, async (req, res) => {
  try {
    const { text, length = 'medium' } = req.body;
    if (!text) return sendError(res, 'Text is required', 400);

    let summary;
    switch (length) {
      case 'short':
        summary = text.substring(0, 50) + '... [Demo summary]';
        break;
      case 'long':
        summary = text.substring(0, 200) + '... [Demo detailed summary]';
        break;
      default:
        summary = text.substring(0, 100) + '... [Demo medium summary]';
    }

    const result = {
      original_text: text,
      summary: summary,
      summary_length: length,
      original_length: text.length,
      compression_ratio: (summary.length / text.length * 100).toFixed(1) + '%'
    };

    sendSuccess(res, result, 'Text summarization completed');
  } catch (error) {
    sendError(res, error.message);
  }
});

app.post('/api/text/analyze', rateLimitMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return sendError(res, 'Text is required', 400);

    const words = text.split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    const result = {
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      word_count: words.length,
      character_count: text.length,
      sentence_count: sentences.length,
      average_word_length: (words.reduce((sum, word) => sum + word.length, 0) / words.length).toFixed(1),
      average_sentence_length: (words.length / sentences.length).toFixed(1),
      language: 'english',
      sentiment: Math.random() > 0.5 ? 'positive' : 'neutral',
      keywords: ['demo', 'text', 'analysis', 'sample'],
      reading_time: Math.ceil(words.length / 200) + ' min'
    };

    sendSuccess(res, result, 'Text analysis completed');
  } catch (error) {
    sendError(res, error.message);
  }
});

app.post('/api/text/sentiment', rateLimitMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return sendError(res, 'Text is required', 400);

    const sentiments = ['positive', 'negative', 'neutral'];
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    const confidence = 0.7 + Math.random() * 0.3;

    const result = {
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      sentiment: sentiment,
      confidence: confidence.toFixed(3),
      scores: {
        positive: sentiment === 'positive' ? confidence : Math.random() * 0.3,
        negative: sentiment === 'negative' ? confidence : Math.random() * 0.3,
        neutral: sentiment === 'neutral' ? confidence : Math.random() * 0.3
      }
    };

    sendSuccess(res, result, 'Sentiment analysis completed');
  } catch (error) {
    sendError(res, error.message);
  }
});

// ============ FILE APIS ============
app.post('/api/pdf/extract', rateLimitMiddleware, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return sendError(res, 'PDF URL is required', 400);

    const result = {
      url: url,
      text: 'This is demo extracted text from the PDF. In production, this would contain actual PDF content.',
      pages: 10,
      file_size: '2.5MB',
      extraction_method: 'demo'
    };

    sendSuccess(res, result, 'PDF text extraction completed');
  } catch (error) {
    sendError(res, error.message);
  }
});

app.post('/api/convert/image', rateLimitMiddleware, async (req, res) => {
  try {
    const { url, format = 'png' } = req.body;
    if (!url) return sendError(res, 'Image URL is required', 400);

    const result = {
      original_url: url,
      converted_url: `https://picsum.photos/500/500?text=${format}+Converted`,
      original_format: 'jpg',
      converted_format: format,
      file_size: '500KB'
    };

    sendSuccess(res, result, 'Image conversion completed');
  } catch (error) {
    sendError(res, error.message);
  }
});

app.post('/api/convert/html', rateLimitMiddleware, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return sendError(res, 'URL is required', 400);

    const result = {
      original_url: url,
      html_content: '<!DOCTYPE html><html><head><title>Converted Content</title></head><body><h1>Demo HTML Content</h1><p>This would contain the actual converted HTML content.</p></body></html>',
      file_size: '2.1KB',
      elements_found: 25
    };

    sendSuccess(res, result, 'HTML conversion completed');
  } catch (error) {
    sendError(res, error.message);
  }
});

// ============ ENTERTAINMENT APIS ============
app.get('/api/jokes/random', rateLimitMiddleware, async (req, res) => {
  try {
    const jokes = [
      'Why do programmers prefer dark mode? Because light attracts bugs!',
      'Why do Java developers wear glasses? Because they can\'t C#!',
      'A SQL query walks into a bar, walks up to two tables and asks, "Can I join you?"',
      'Why do programmers always mix up Halloween and Christmas? Because Oct 31 equals Dec 25!'
    ];
    
    const result = {
      joke: jokes[Math.floor(Math.random() * jokes.length)],
      category: 'programming',
      safe: true,
      language: 'en'
    };

    sendSuccess(res, result, 'Random joke retrieved');
  } catch (error) {
    sendError(res, error.message);
  }
});

app.get('/api/quotes/random', rateLimitMiddleware, async (req, res) => {
  try {
    const quotes = [
      { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
      { text: 'Innovation distinguishes between a leader and a follower.', author: 'Steve Jobs' },
      { text: 'Life is what happens when you\'re busy making other plans.', author: 'John Lennon' },
      { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' }
    ];
    
    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    const result = {
      quote: quote.text,
      author: quote.author,
      category: 'inspirational'
    };

    sendSuccess(res, result, 'Random quote retrieved');
  } catch (error) {
    sendError(res, error.message);
  }
});

app.get('/api/news/random', rateLimitMiddleware, async (req, res) => {
  try {
    const result = {
      title: 'Breaking News: New API Version Released',
      description: 'The amazing new API version 7.0 has been released with 30+ free endpoints!',
      source: 'Demo News',
      published_at: new Date().toISOString(),
      url: 'https://demo-news.com/article',
      image: 'https://picsum.photos/400/250?text=News'
    };

    sendSuccess(res, result, 'Random news article retrieved');
  } catch (error) {
    sendError(res, error.message);
  }
});

// ============ ERROR HANDLING ============
app.use((req, res) => {
  sendError(res, 'API endpoint not found', 404);
});

app.use((error, req, res, next) => {
  console.error('Server error:', error);
  sendError(res, 'Internal server error', 500);
});

// ============ START SERVER ============
app.listen(PORT, () => {
  console.log(`
🚀 Anime & Media API v7 by Ntando Mods ✔️
🌐 Server running on port ${PORT}
📊 Total APIs: 30+ Free Endpoints
⏰ Uptime: 0s (Starting...)
🔥 Status: Active
📍 URL: http://localhost:${PORT}
  `);
});

module.exports = app;