# nwp_models/services/tiling.py
"""
Tile URL builder (for titiler or external tile service)
"""

def build_tile_url(cog_url: str) -> str:
    return f"http://localhost:8001/cog/tiles/{{z}}/{{x}}/{{y}}.png?url={cog_url}"
