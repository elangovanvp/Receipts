#!/usr/bin/env python3
"""Render a 3:2 Devpost thumbnail (1200x800) for Receipts."""
import os
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from make_logo import seal  # noqa: E402

W, H = 1200, 800
PAPER = (245, 243, 236)
INK = (26, 25, 22)
INK_MUT = (87, 84, 76)
CLAY_D = (168, 71, 42)
FAINT = (138, 135, 124)


def font(paths, sz):
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, sz)
    return ImageFont.load_default()


WF = r"C:\Windows\Fonts"
geo_b = font([os.path.join(WF, "georgiab.ttf")], 124)
geo_i = font([os.path.join(WF, "georgiai.ttf")], 44)
sans = font([os.path.join(WF, "segoeui.ttf"), os.path.join(WF, "calibri.ttf")], 31)
mono = font([os.path.join(WF, "consola.ttf"), os.path.join(WF, "cour.ttf")], 21)

img = Image.new("RGBA", (W, H), PAPER + (255,))

# soft clay glow, upper area
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ImageDraw.Draw(glow).ellipse([W * 0.18, -H * 0.45, W * 0.82, H * 0.52],
                             fill=(194, 90, 56, 42))
img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(130)))

d = ImageDraw.Draw(img)
d.text((W / 2, 118), "CASE FILE   //   COMPETITIVE INTELLIGENCE",
       font=mono, fill=CLAY_D + (255,), anchor="mm")

seal(W, W // 2, 300, 92, img)

d = ImageDraw.Draw(img)
d.text((W / 2, 472), "Receipts", font=geo_b, fill=INK + (255,), anchor="mm")
d.text((W / 2, 562), "No source, no claim.", font=geo_i, fill=CLAY_D + (255,), anchor="mm")
d.text((W / 2, 630), "Competitive teardowns that show their sources.",
       font=sans, fill=INK_MUT + (255,), anchor="mm")
d.text((W / 2, 712), "receipts-murex.vercel.app", font=mono, fill=FAINT + (255,), anchor="mm")

out = os.path.join(HERE, "receipts-thumbnail.png")
img.convert("RGB").save(out, quality=92)
print("wrote", out, img.size)
