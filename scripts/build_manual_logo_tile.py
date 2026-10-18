"""Wrap the existing logo in an SVG tile showing only 聖人用品, with repeat spacing."""

from base64 import b64encode
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/graphics/top-logo.webp"
TARGET = ROOT / "assets/graphics/manual-logo-tile.svg"


def main():
    # In the original 2054x334 logo, the fourth character ends at x=1336;
    # the fifth begins at x=1377. Clip between them, preserving the exact artwork.
    encoded = b64encode(SOURCE.read_bytes()).decode("ascii")
    TARGET.write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 420">\n'
        '  <!-- Original logo artwork, clipped to 聖人用品. Blank space supplies column/row gaps. -->\n'
        '  <defs><clipPath id="word"><rect width="1357" height="334"/></clipPath></defs>\n'
        f'  <image width="2054" height="334" clip-path="url(#word)" href="data:image/webp;base64,{encoded}"/>\n'
        '</svg>\n'
    )
    print(f"Built {TARGET.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
