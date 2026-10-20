"""Build a spaced 聖人用品 background tile with a thicker logo silhouette."""

from base64 import b64encode
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/graphics/top-logo.png"
TARGET = ROOT / "assets/graphics/manual-logo-tile.svg"
# [배경 로고 외곽선 굵기] 기본 PC 화면에서 약 5px 스트로크 효과.
# SVG 타일은 원본 크기로 저장되므로 표시 너비(920px / 2열)에 맞춰 환산합니다.
STROKE_WIDTH = 5
SOURCE_RADIUS = round(STROKE_WIDTH / 2 * 1440 / 460, 3)


def main():
    # In the original 2054x334 logo, the fourth character ends at x=1336;
    # the fifth begins at x=1377. Clip between them, preserving the exact artwork.
    encoded = b64encode(SOURCE.read_bytes()).decode("ascii")
    TARGET.write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1440 420">\n'
        '  <!-- Original logo, clipped before thickening. Insets prevent the expanded edges from being cut off. -->\n'
        '  <defs>\n'
        '    <clipPath id="word"><rect x="16" y="16" width="1357" height="334"/></clipPath>\n'
        '    <filter id="bold" filterUnits="userSpaceOnUse" x="0" y="0" width="1440" height="420">\n'
        f'      <feMorphology in="SourceAlpha" operator="dilate" radius="{SOURCE_RADIUS}" result="expanded"/>\n'
        '      <feFlood flood-color="#000" result="ink"/>\n'
        '      <feComposite in="ink" in2="expanded" operator="in"/>\n'
        '    </filter>\n'
        '  </defs>\n'
        '  <g filter="url(#bold)">\n'
        f'    <image x="16" y="16" width="2054" height="334" clip-path="url(#word)" xlink:href="data:image/png;base64,{encoded}"/>\n'
        '  </g>\n'
        '</svg>\n'
    )
    print(f"Built {TARGET.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
