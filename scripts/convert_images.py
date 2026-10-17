"""Create WebP delivery images beside the original PNG/JPEG files.

Run with Python 3 and Pillow: python3 scripts/convert_images.py
Original images, dimensions and alpha channels are preserved.
"""

from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import json

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"


def convert(source):
    target = source.with_suffix(".webp")
    if target.exists() and target.stat().st_mtime >= source.stat().st_mtime:
        return source, target

    with Image.open(source) as image:
        image.load()
        # Keep lettering, logos, stamps and the small cursor pixel-perfect.
        lossless = "cursor" in source.name.lower() or (source.name in {
            "top-logo.png", "bottom_logo.png", "Menu bar.png",
            "stamp_red.png", "stamp_gray.png", "1.png",
        } and source.parent.name in {"graphics", "product_mein", "manual"})
        quality = 92 if source.parent.name in {"Product Detail Page", "manual"} else 88
        image.save(target, "WEBP", lossless=lossless, quality=quality, method=6)

    with Image.open(target) as result:
        assert result.size == image.size, f"Dimensions changed: {source}"
        result.verify()
    return source, target


def main():
    sources = []
    for path in sorted(ASSETS.rglob("*")):
        if not path.is_file() or path.name.startswith("."):
            continue
        if path.suffix.lower() in {".png", ".jpg", ".jpeg"}:
            sources.append(path)
        elif not path.suffix:
            with Image.open(path) as image:
                if image.format in {"PNG", "JPEG"}:
                    sources.append(path)
    # Refuse ambiguous names instead of replacing a different source's WebP.
    targets = [source.with_suffix(".webp") for source in sources]
    assert len(targets) == len(set(targets)), "Multiple originals have the same WebP filename"
    with ThreadPoolExecutor(max_workers=4) as pool:
        pairs = list(pool.map(convert, sources))
    original = sum(source.stat().st_size for source, _ in pairs)
    converted = sum(target.stat().st_size for _, target in pairs)
    print(json.dumps({
        "images": len(pairs),
        "original_bytes": original,
        "webp_bytes": converted,
        "reduction_percent": round(100 * (1 - converted / original), 1),
    }, indent=2))


if __name__ == "__main__":
    main()
