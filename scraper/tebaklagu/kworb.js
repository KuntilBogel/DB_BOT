import axios from 'axios';
import { load } from 'cheerio';
import fs from 'fs';
import jsonpath from 'jsonpath';
import pLimit from 'p-limit';
import dotenv from 'dotenv';

dotenv.config();

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// Get an access token using the Client Credentials flow.
async function getSpotifyToken() {
  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const response = await axios.post(
    tokenUrl,
    'grant_type=client_credentials',
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')
      }
    }
  );
  return response.data.access_token;
}

// Search Spotify for a track using artist and song name.
async function fetchTrackIdFromSpotify(artist, song, token) {
  const query = encodeURIComponent(`${artist} ${song}`);
  const url = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`;
  try {
    const response = await axios.get(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const tracks = response.data.tracks.items;
    if (tracks && tracks.length > 0) {
      return tracks[0].id;
    } else {
      console.log(`No Spotify track found for: ${artist} - ${song}`);
      return 'unknown';
    }
  } catch (err) {
    console.error(`Error searching Spotify for ${artist} - ${song}:`, err.message);
    return 'unknown';
  }
}

// Fetch the preview URL from Spotify's embed page, with retry logic.
async function fetchPreviewUrl(trackId) {
  const embedUrl = `https://open.spotify.com/embed/track/${trackId}`;
  const maxRetries = 3;
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      const response = await axios.get(embedUrl);
      if (response.status !== 200) {
        console.log(`Failed to fetch embed page (status ${response.status}).`);
        return null;
      }
      const html = response.data;
      const $ = load(html);
      const scriptElements = $('script');
      for (let i = 0; i < scriptElements.length; i++) {
        const scriptContent = $(scriptElements[i]).html();
        if (scriptContent && scriptContent.trim().length > 0) {
          try {
            const jsonData = JSON.parse(scriptContent);
            const result = jsonpath.query(jsonData, '$..audioPreview.url');
            if (result && result.length > 0) {
              return result[0];
            }
          } catch (jsonErr) {
            continue;
          }
        }
      }
      return null;
    } catch (err) {
      if (err.response && err.response.status === 429) {
        const retryAfter = err.response.headers['retry-after'];
        const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : 2000;
        console.log(`Received 429. Retrying after ${delay / 1000} seconds... (attempt ${attempts + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error("Error fetching preview URL:", err.message);
        return null;
      }
    }
    attempts++;
  }
  console.log(`Max retries reached for trackId ${trackId}.`);
  return null;
}

(async () => {
  try {
    const token = await getSpotifyToken();
    const response = await axios.get('https://kworb.net/spotify/songs.html');
    const html = response.data;
    const $ = load(html);
    const rows = $('table tbody tr').toArray().slice(0, 400);
    
    // Limit concurrency to 5 simultaneous Spotify API calls.
    const limit = pLimit(5);
    const songPromises = rows.map((element, index) => {
      return limit(async () => {
        const artistTitle = $(element).find('td.text div').text().trim();
        const [artist, song] = artistTitle.split(' - ');
        const streams = $(element).find('td:nth-child(2)').text().trim();
    
        // Use the Spotify API to get the track ID.
        const trackId = await fetchTrackIdFromSpotify(artist.trim(), song.trim(), token);
        const trackLink = trackId !== 'unknown' ? `https://open.spotify.com/track/${trackId}` : 'unknown';
        const preview_url = trackId !== 'unknown' ? await fetchPreviewUrl(trackId) : null;
    
        // Add a cooldown of 0.5 seconds
        await new Promise(resolve => setTimeout(resolve, 500));
    
        return {
          rank: index + 1,
          artist: artist ? artist.trim() : '',
          song: song ? song.trim() : '',
          streams,
          trackId,
          trackLink,
          preview_url
        };
      });
    });;
    
    const songs = await Promise.all(songPromises);
    console.log(songs);
    fs.writeFileSync('top_400_songs.json', JSON.stringify(songs, null, 2));
  } catch (error) {
    console.error('Error fetching the page:', error);
  }
})();
