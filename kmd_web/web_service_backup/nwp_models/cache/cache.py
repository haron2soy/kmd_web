# services/cache.py

from django.core.cache import cache
import hashlib
import json

def build_cache_key(params: dict):
    raw = json.dumps(params, sort_keys=True)
    return "geodata:" + hashlib.md5(raw.encode()).hexdigest()

def get_or_set(key, fetch_fn, timeout=1800):
    """
    Fetch from cache if exists, else compute and store.
    """
    data = cache.get(key)
    if data:
        return data

    # ⚡ Important: fetch_fn should return only JSON-safe or lightweight data (metadata / URLs)
    data = fetch_fn()
    cache.set(key, data, timeout)
    return data
