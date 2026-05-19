"use strict";

const Redis = require("ioredis");

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  retryStrategy: () => null,
  reconnectOnError: () => false,
  lazyConnect: true,
  maxRetriesPerRequest: 0,
});

const CACHE_KEY = "coaching:feeds";
const CACHE_TTL = parseInt(process.env.CACHE_TTL || "60", 10);

let isRedisConnected = false;

redis.on("connect", () => {
  isRedisConnected = true;
  console.log("✅ [Redis] Connected");
});
redis.on("error", () => {
  isRedisConnected = false;
  // Silently fail — application continues without cache
});
redis.on("end", () => {
  isRedisConnected = false;
});

async function getCache() {
  if (!isRedisConnected) return null;
  try {
    const cached = await redis.get(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

async function setCache(data) {
  if (!isRedisConnected) return;
  try {
    await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(data));
    console.log(`✅ [Cache] Feeds cached for ${CACHE_TTL}s`);
  } catch { }
}

async function invalidateCache() {
  if (!isRedisConnected) return;
  try {
    await redis.del(CACHE_KEY);
    console.log("🗑️  [Cache] Feed cache invalidated");
  } catch { }
}

module.exports = { redis, isRedisConnected: () => isRedisConnected, getCache, setCache, invalidateCache };
