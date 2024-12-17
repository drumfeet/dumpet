class CacheService {
  constructor(defaultExpiry = 5 * 60 * 1000) {
    this.defaultExpiry = defaultExpiry
  }

  set(key, data, expiryInMs = this.defaultExpiry) {
    const item = {
      data,
      timestamp: new Date().getTime(),
      expiry: expiryInMs,
    }
    localStorage.setItem(key, JSON.stringify(item))
  }

  get(key) {
    const item = localStorage.getItem(key)
    if (!item) return null

    const { data, timestamp, expiry } = JSON.parse(item)
    const now = new Date().getTime()

    // Check if the data has expired
    if (now - timestamp > expiry) {
      this.remove(key)
      return null
    }

    return data
  }

  remove(key) {
    localStorage.removeItem(key)
  }

  clear() {
    localStorage.clear()
  }

  // Optional: Get time until expiry in seconds
  getTimeToExpiry(key) {
    const item = localStorage.getItem(key)
    if (!item) return 0

    const { timestamp, expiry } = JSON.parse(item)
    const now = new Date().getTime()
    const timeLeft = expiry - (now - timestamp)
    return Math.max(0, Math.floor(timeLeft / 1000))
  }
}

export const cacheService = new CacheService()
