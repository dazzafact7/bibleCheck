import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const CACHE_DIR = path.join(process.cwd(), '.cache');

// Cache-Verzeichnis erstellen, falls nicht vorhanden
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// MD5 Hash für Cache-Keys
const generateCacheKey = (input) => {
  return crypto
    .createHash('md5')
    .update(input)
    .digest('hex')
    .substring(0, 16);
};

// Aus Cache lesen
export async function getFromCache(key) {
  try {
    const cacheKey = generateCacheKey(key);
    const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`);
    
    if (fs.existsSync(cachePath)) {
      const cacheData = fs.readFileSync(cachePath, 'utf-8');
      const parsed = JSON.parse(cacheData);
      
      // Cache-Gültigkeit prüfen (24 Stunden)
      const cacheAge = Date.now() - parsed.timestamp;
      if (cacheAge < 24 * 60 * 60 * 1000) {
        console.log(`Cache hit: ${cacheKey}`);
        return parsed.data;
      }
    }
  } catch (error) {
    console.error('Cache read error:', error);
  }
  
  return null;
}

// In Cache speichern
export async function saveToCache(key, data) {
  try {
    const cacheKey = generateCacheKey(key);
    const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`);
    
    const cacheData = {
      timestamp: Date.now(),
      key: key.substring(0, 100),
      data: data
    };
    
    fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
    console.log(`Cache saved: ${cacheKey}`);
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

// Cache leeren (optional)
export function clearCache() {
  try {
    const files = fs.readdirSync(CACHE_DIR);
    files.forEach(file => {
      if (file.endsWith('.json')) {
        fs.unlinkSync(path.join(CACHE_DIR, file));
      }
    });
    console.log('Cache cleared');
  } catch (error) {
    console.error('Cache clear error:', error);
  }
}