"""Build small web fonts from the existing originals (FontTools + Brotli).

Run again after changing site text. The original fonts remain unchanged.
Safari 13 uses fixed Noto weights instead of selecting an axis in a variable font.
"""
from pathlib import Path
from copy import deepcopy

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parents[1]
FONTS = ROOT / "assets/fonts"
OUTPUT = FONTS / "web"


def site_codepoints():
    text = "".join(chr(code) for code in range(32, 127))
    for folder, extension in (("js", ".js"), ("css", ".css")):
        for path in (ROOT / folder).rglob(f"*{extension}"):
            text += path.read_text()
    for path in ROOT.glob("*.html"):
        text += path.read_text()
    return {ord(character) for character in text}


def subset_font(path, codepoints):
    font = TTFont(path)
    options = subset.Options()
    options.name_IDs = ["*"]
    options.name_legacy = True
    options.name_languages = ["*"]
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=codepoints)
    subsetter.subset(font)
    return font


def main():
    OUTPUT.mkdir(exist_ok=True)
    codepoints = site_codepoints()
    noto = subset_font(FONTS / "NotoSansKR-Variable.ttf", codepoints)
    for weight in (400, 500, 600, 700, 800, 900):
        font = instantiateVariableFont(deepcopy(noto), {"wght": weight}, inplace=True, updateFontNames=True)
        font.flavor = "woff2"
        font.save(OUTPUT / f"NotoSansKR-{weight}.woff2")
    display = subset_font(FONTS / "SM3GyeonchulMyeongjo-Regular.otf", codepoints)
    # Keep the subset distinct from the full original in CoreText's font cache.
    names = {
        1: "Perfect Display", 2: "Regular", 3: "PerfectDisplay-Regular-Web",
        4: "Perfect Display Regular", 6: "PerfectDisplay-Regular",
        16: "Perfect Display", 17: "Regular",
    }
    display["name"].names = [record for record in display["name"].names if record.nameID not in names]
    for name_id, value in names.items():
        display["name"].setName(value, name_id, 3, 1, 0x409)
        display["name"].setName(value, name_id, 1, 0, 0)
    display["OS/2"].usWeightClass = 400
    cff = display["CFF "].cff
    cff.fontNames = ["PerfectDisplay-Regular"]
    cff.topDictIndex[0].FamilyName = "Perfect Display"
    cff.topDictIndex[0].FullName = "Perfect Display Regular"
    display.flavor = "woff2"
    display.save(OUTPUT / "SM3GyeonchulMyeongjo-Display.woff2")
    for path in sorted(OUTPUT.glob("*.woff2")):
        print(f"{path.name}: {path.stat().st_size / 1024:.1f} KiB")


if __name__ == "__main__":
    main()
