"""
One-off asset extraction for Milestone 7 (Audio & Visual Polish).

Crops the game sprites out of spec/style-guide.png and writes transparent PNGs
into src/assets/images/. Run once from the project root:

    python tools/extract-sprites.py

The source is the project's own design reference (spec/style-guide.png), so the
extracted sprites are first-party assets. Sprites sit on the flat dark panel
background of the style guide; we remove that background with an edge flood-fill
(only the dark region connected to the crop border is cleared), which preserves
dark features *inside* a sprite such as the enemies' eyes. Each sprite is then
auto-trimmed to its opaque bounding box.

Coordinates are tuned to the current style-guide.png (1312x1199). If that image
is regenerated, re-check the crop boxes below.
"""

from pathlib import Path
from collections import deque
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "spec" / "style-guide.png"
OUT = ROOT / "src" / "assets" / "images"

# Absolute crop boxes (left, top, right, bottom) in the style-guide image.
# Generous on purpose — auto-trim tightens each one to its real content.
CROPS = {
    "enemy-small": (812, 298, 898, 430),   # green,  1 hit
    "enemy-medium": (942, 298, 1048, 420),  # pink,   2 hits
    "enemy-large": (1074, 298, 1172, 419),  # yellow, 3 hits
    "cannon": (930, 558, 1028, 688),        # front pose, barrel pointing up
    "laser": (816, 788, 864, 908),          # laser projectile
    "explosion-small": (908, 798, 975, 902),
    "explosion-medium": (998, 792, 1075, 906),
    "explosion-large": (1088, 782, 1188, 908),
    "explosion-cannon": (1200, 782, 1292, 908),  # purple cannon blast
}

# A pixel is "background" only if it is dark (max channel below this) AND
# reachable from the crop border through other dark pixels.
DARK_MAX = 82


def remove_dark_background(img: Image.Image) -> Image.Image:
    img = img.convert("RGBA")
    w, h = img.size
    px = img.load()
    visited = bytearray(w * h)
    queue = deque()

    def is_dark(x: int, y: int) -> bool:
        r, g, b, _ = px[x, y]
        return max(r, g, b) < DARK_MAX

    # Seed the flood fill from every border pixel that is dark.
    for x in range(w):
        for y in (0, h - 1):
            if not visited[y * w + x] and is_dark(x, y):
                visited[y * w + x] = 1
                queue.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if not visited[y * w + x] and is_dark(x, y):
                visited[y * w + x] = 1
                queue.append((x, y))

    while queue:
        x, y = queue.popleft()
        r, g, b, _ = px[x, y]
        px[x, y] = (r, g, b, 0)  # clear connected background pixel
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not visited[ny * w + nx] and is_dark(nx, ny):
                visited[ny * w + nx] = 1
                queue.append((nx, ny))

    return img


def autotrim(img: Image.Image) -> Image.Image:
    bbox = img.getbbox()  # bbox of non-zero (non-transparent) pixels
    return img.crop(bbox) if bbox else img


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    source = Image.open(SRC)

    for name, box in CROPS.items():
        sprite = autotrim(remove_dark_background(source.crop(box)))
        sprite.save(OUT / f"{name}.png")
        print(f"{name}.png {sprite.size}")

    # Background: keep the space texture opaque; crop inside the rounded panel
    # border so no panel edge is included.
    bg = source.crop((808, 1008, 1287, 1167)).convert("RGBA")
    bg.save(OUT / "background.png")
    print(f"background.png {bg.size}")


if __name__ == "__main__":
    main()
