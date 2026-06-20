#!/usr/bin/env python3
"""Render Receipts logo PNGs (app-icon mark + horizontal lockup) with Pillow."""
import os
from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
CLAY = (194, 90, 56)
CLAY_HI = (224, 122, 92)
CLAY_EDGE = (122, 48, 32)
CREAM = (255, 238, 225)
INK = (26, 25, 22)


def seal(size, cx, cy, R, base_img):
    """Draw a wax-seal mark (clay circle + sheen + checkmark) onto base_img."""
    S = base_img.size[0]
    d = ImageDraw.Draw(base_img)
    # base circle + embossed edge
    d.ellipse([cx - R, cy - R, cx + R, cy + R], fill=CLAY + (255,),
              outline=CLAY_EDGE + (255,), width=max(2, int(R * 0.05)))
    # soft top-left sheen, clipped to the seal
    hl = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    hd = ImageDraw.Draw(hl)
    hr = int(R * 0.72)
    hcx, hcy = int(cx - R * 0.30), int(cy - R * 0.32)
    hd.ellipse([hcx - hr, hcy - hr, hcx + hr, hcy + hr], fill=CLAY_HI + (190,))
    hl = hl.filter(ImageFilter.GaussianBlur(int(R * 0.28)))
    mask = Image.new("L", (S, S), 0)
    ImageDraw.Draw(mask).ellipse([cx - R, cy - R, cx + R, cy + R], fill=255)
    hl.putalpha(ImageChops.multiply(hl.split()[3], mask))
    base_img.alpha_composite(hl)
    # dashed inner ring
    d = ImageDraw.Draw(base_img)
    ir = int(R * 0.73)
    import math
    n = 60
    for k in range(n):
        if k % 2:
            continue
        a0 = (k / n) * 2 * math.pi
        x = cx + ir * math.cos(a0)
        y = cy + ir * math.sin(a0)
        rr = max(1, int(R * 0.018))
        d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=CREAM + (150,))
    # checkmark with round caps
    w = max(3, int(R * 0.16))
    p1 = (cx - R * 0.40, cy + R * 0.02)
    p2 = (cx - R * 0.07, cy + R * 0.33)
    p3 = (cx + R * 0.45, cy - R * 0.34)
    d.line([p1, p2, p3], fill=CREAM + (255,), width=w, joint="curve")
    for p in (p1, p2, p3):
        d.ellipse([p[0] - w / 2, p[1] - w / 2, p[0] + w / 2, p[1] + w / 2],
                  fill=CREAM + (255,))


def make_icon(S, out):
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(img).rounded_rectangle(
        [0, 0, S - 1, S - 1], radius=int(S * 0.22), fill=INK + (255,))
    seal(S, S // 2, S // 2, int(S * 0.31), img)
    img.save(out)
    print("wrote", out)


def make_lockup(out):
    W, H = 1000, 240
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    R = 84
    cx, cy = 108, H // 2
    seal(max(W, H), cx, cy, R, img)
    # wordmark
    font = None
    for path in (r"C:\Windows\Fonts\georgiab.ttf", r"C:\Windows\Fonts\georgia.ttf"):
        if os.path.exists(path):
            font = ImageFont.truetype(path, 124)
            break
    d = ImageDraw.Draw(img)
    if font:
        d.text((228, cy + 2), "Receipts", font=font, fill=INK + (255,), anchor="lm")
    else:
        d.text((228, cy - 20), "Receipts", fill=INK + (255,))
    img.save(out)
    print("wrote", out)


if __name__ == "__main__":
    make_icon(512, os.path.join(HERE, "receipts-icon-512.png"))
    make_icon(1024, os.path.join(HERE, "receipts-icon-1024.png"))
    make_lockup(os.path.join(HERE, "receipts-logo-lockup.png"))
