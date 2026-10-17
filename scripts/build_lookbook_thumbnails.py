"""Build small WebP thumbnails for the About lookbook, preserving originals."""

from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DESTINATION = ROOT / "assets" / "lookbook-thumbnails"


def build(source):
    target = DESTINATION / source.name
    with Image.open(source) as image:
        image.thumbnail((360, 480), Image.Resampling.LANCZOS)
        image.save(target, "WEBP", quality=82, method=6)
    return target.stat().st_size


if __name__ == "__main__":
    DESTINATION.mkdir(parents=True, exist_ok=True)
    sources = sorted((ROOT / "assets" / "product_model").glob("*.webp"))
    with ThreadPoolExecutor(max_workers=4) as pool:
        sizes = list(pool.map(build, sources))
    print(f"Created {len(sizes)} thumbnails: {sum(sizes) / 1024:.0f} KiB total")
