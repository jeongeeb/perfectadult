"""Build original-format fallbacks for browsers that cannot decode WebP.

Modern browsers keep using WebP. Originals are retained unchanged; Safari 13
receives smaller PNG/JPEG delivery copies. Long detail pages retain full size.
"""
from pathlib import Path
import json
from concurrent.futures import ThreadPoolExecutor

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"


def original_for(webp):
    # One legacy file had a .webp suffix but contained PNG data. Preserve its
    # original bytes under the correct extension before encoding actual WebP.
    with Image.open(webp) as image:
        if image.format != "WEBP":
            original = webp.with_suffix(".png")
            if not original.exists():
                original.write_bytes(webp.read_bytes())
            image.save(webp, "WEBP", quality=88, method=6)

    for extension in (".png", ".jpg", ".jpeg"):
        original = webp.with_suffix(extension)
        if original.exists():
            return original
    extensionless = webp.with_suffix("")
    if extensionless.is_file():
        original = webp.with_suffix(".png")
        original.write_bytes(extensionless.read_bytes())
        return original
    # The cropped list thumbnails can fall back to the corresponding full-size
    # photo; object-fit: cover preserves the same 3:4 display crop.
    if webp.parent.name == "lookbook-thumbnails":
        model = ASSETS / "product_model" / webp.name
        if model.exists():
            return original_for(model)
    # Product 16 has only a high-resolution WebP. Keep it unchanged and add a
    # PNG for decoding failures only. This is not loaded on supporting browsers.
    original = webp.with_name(webp.stem + "-compat.png")
    if not original.exists():
        with Image.open(webp) as image:
            image.save(original, "PNG")
    return original


def build_stamp_displays():
    """The stamps display at 160px, so a 512px alpha image also covers Retina."""
    destination = ASSETS / "display"
    destination.mkdir(exist_ok=True)
    for name in ("stamp_red", "stamp_gray"):
        with Image.open(ASSETS / "graphics" / f"{name}.png") as image:
            image.thumbnail((512, 512), Image.Resampling.LANCZOS)
            image.save(destination / f"{name}.png", "PNG", optimize=True)
            image.save(destination / f"{name}.webp", "WEBP", lossless=True, method=6)


def build_delivery(webp):
    original = original_for(webp)
    if webp.parent.name == "display":
        return webp.relative_to(ROOT).as_posix(), original.relative_to(ROOT).as_posix(), original
    # List thumbnails already have the exact crop. Encode that small delivery
    # image instead of requesting the much larger full-size portrait.
    source = webp if webp.parent.name == "lookbook-thumbnails" else original
    with Image.open(source) as image:
        image.load()
        if webp.parent.name != "Product Detail Page":
            maximum = (2048, 2048)
            if webp.parent.name == "product_model":
                maximum = (1600, 1600)
            elif webp.stem in {"stamp_red", "stamp_gray"}:
                maximum = (512, 512)
            elif webp.name == "all_person.webp":
                maximum = (3200, 3200)
            image.thumbnail(maximum, Image.Resampling.LANCZOS)
        transparent = image.mode in ("RGBA", "LA") and image.getchannel("A").getextrema()[0] < 255
        # Portraits only sit on white page/list backgrounds. JPEG is much
        # smaller there; overlapping product cutouts and graphics retain alpha.
        # The home hero graphics sit on YELLOW, so they must retain alpha.
        white_photo = webp.parent.name in {"product_model", "lookbook-thumbnails", "basic person"}
        use_png = (transparent and not white_photo) or (
            webp.parent.name in {"graphics", "display"} and not white_photo
        )
        extension = ".png" if use_png else ".jpg"
        target = (ASSETS / "compat" / webp.relative_to(ASSETS)).with_suffix(extension)
        target.parent.mkdir(parents=True, exist_ok=True)
        if use_png:
            image.save(target, "PNG", optimize=True)
        else:
            if transparent:
                canvas = Image.new("RGB", image.size, "white")
                canvas.paste(image.convert("RGB"), mask=image.getchannel("A"))
            else:
                canvas = image.convert("RGB")
            canvas.save(target, "JPEG", quality=88, subsampling=0, optimize=True, progressive=True)
    return webp.relative_to(ROOT).as_posix(), target.relative_to(ROOT).as_posix(), original


def main():
    build_stamp_displays()
    webps = sorted(ASSETS.rglob("*.webp"))
    with ThreadPoolExecutor(max_workers=4) as pool:
        deliveries = list(pool.map(build_delivery, webps))
    fallbacks = {key: target for key, target, _ in deliveries}
    generated = {ROOT / target for target in fallbacks.values()}
    for previous in (ASSETS / "compat").rglob("*"):
        if previous.is_file() and previous not in generated:
            previous.unlink()
    destination = ROOT / "js/shared/image-fallbacks.js"
    destination.write_text(
        "// Generated by scripts/build_image_fallbacks.py. Legacy PNG/JPEG delivery copies.\n"
        + "const IMAGE_FALLBACKS = Object.freeze("
        + json.dumps(fallbacks, ensure_ascii=False, indent=2) + ");\n"
    )
    originals = {original for _, _, original in deliveries}
    before = sum(path.stat().st_size for path in originals)
    after = sum((ROOT / target).stat().st_size for target in fallbacks.values())
    print(f"Mapped {len(fallbacks)} WebP images to optimized Safari 13 fallbacks: "
          f"{before / 1024**2:.1f} MiB originals → {after / 1024**2:.1f} MiB delivery files.")


if __name__ == "__main__":
    main()
