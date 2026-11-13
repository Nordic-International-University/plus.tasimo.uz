"""
TASIMO Plus logotiplarini PNG dan SVG ga aylantirish:  python -X utf8 scripts/trace-logos.py [nom ...] [--out DIR]

Natija (har logotip uchun):
  branding/svg/<nom>.svg      — toza statik SVG (brend ranglari: #0A62B3, #CEE4F8, oq) — bosma va boshqa joylar uchun
  scripts/.trace/<nom>.json   — qismlar (qatlam, chegaralar, path) — gen-logos.mjs animatsiya guruhlarini shundan yig'adi

Manba PNG'lar — branding/ papkasida (rasmiy logotip — Brand Guidelines PDF ichidagi «tasimo plus.png», 3-sahifa).
"""

from __future__ import annotations

import json
import os
import sys

import numpy as np
import pymupdf

sys.path.insert(0, os.path.dirname(__file__))
from trace_lib import (  # noqa: E402
    Part,
    path_points,
    beziers_to_d,
    build_parts,
    extend_under,
    gaussian_blur,
    layer_coverage,
    load_rgba,
    loop_to_beziers,
    marching_squares,
)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRAND = os.path.join(ROOT, "branding")

# Brend ranglari (Brand Guidelines, 09/24): PLUS BLUE, PLUS LIGHT; oq; logotipdagi o'rta ko'k — ikkisi orasidagi ton
INK = "#0A62B3"
SOFT = "#CEE4F8"
MID = "#6CA6E3"
WHITE = "#FFFFFF"

LOGOS = {
    # Rasmiy logotip: oq TASIMO (maxsus M/O) + ko'k gradientli PLUS plashkasi — to'q fonda
    "reference": {
        "src": "pdf:TASIMO_Plus_Brand_Guidelines.pdf#3",
        # Plashka ranglari faqat plashka atrofida — oq harflar chetidagi ko'kish antialias bo'laklari plashkaga aylanmasin
        "palette": [((255, 255, 255), "white"), ((60, 132, 196), "plate", (1615, 715, 1965, 860)), ((170, 204, 238), "plate", (1615, 715, 1965, 860))],
        "order": ["plate", "white"],
        "fills": {"white": WHITE, "plate": "url(#g)"},
        "emblem": {"layer": "white", "region": (1120, 185, 1410, 478)},
        "geometric_plate": "plate",
    },
    "mountain": {
        "src": "TASIMO_Plus_горная_эмблема_для_открытий_1.png",
        # O'rta ko'k faqat PLUS kapsulasida (aks holda to'q/och chegaralari o'rta rangga o'xshab qoladi)
        "palette": [
            ((8, 80, 170), "ink"),
            ((106, 164, 234), "mid", (1580, 255, 1895, 366)),  # kapsula (manba koordinatasi)
            # och ko'k — tog' yonbag'irlari; kapsula ichida yo'q (oq harf + o'rta ko'k chegarasi och ko'kka o'xshaydi)
            ((200, 224, 247), "soft", ("not", (1622, 268, 1895, 366))),
            ((252, 252, 252), "white"),
        ],
        # «O» dagi qushcha traced holicha qoladi: konsept logotip og'irroq chizilgan, rasmiy emblema unda ingichka ko'rinadi
        "order": ["soft", "mid", "white", "ink"],
        "fills": {"ink": INK, "mid": MID, "soft": SOFT, "white": WHITE},
    },
    "compass": {
        "src": "Tasimo Plus — логотип с компасом.png",
        "palette": [((6, 88, 172), "ink"), ((190, 222, 246), "soft"), ((252, 252, 252), "white")],
        "order": ["soft", "white", "ink"],
        "fills": {"ink": INK, "soft": SOFT, "white": WHITE},
    },
    "compass2": {
        "src": "Логотип TASIMO Plus с компасом-2.png",
        "palette": [((6, 80, 162), "ink"), ((206, 234, 246), "soft")],
        "order": ["soft", "ink"],
        "fills": {"ink": INK, "soft": SOFT},
    },
    "tent": {
        "src": "Тасимо_Плюс_—_палатка_и_горы_в_буквах.png",
        "palette": [((6, 90, 164), "ink"), ((200, 224, 246), "soft")],
        "order": ["soft", "ink"],
        "fills": {"ink": INK, "soft": SOFT},
    },
}

def load_emblem() -> dict[str, str]:
    """Rasmiy TASIMO qushcha emblemasi (dashboard logo.svg → gen-logo.mjs → logo-data.ts)."""
    import re

    text = open(os.path.join(ROOT, "src", "components", "logo", "logo-data.ts"), encoding="utf-8").read()
    block = re.search(r"emblem:\s*\{(.*?)\n  \}", text, re.S).group(1)
    return {k: re.search(r'"%s":\s*"([^"]+)"' % k, block).group(1) for k in ("ring", "wingA", "wingB", "wingC", "head")}


ERROR = 0.9  # manba pikselida ruxsat etilgan og'ish (sarlavhada ~0.2 CSS px — ko'rinmaydi; manba xira — shovqinni takrorlamaymiz)
SIGMA = 0.55
EXTEND = 3
MIN_AREA = 30.0  # bundan kichik — antialias changi (eng kichik haqiqiy qism ~340 px²)


def load_source(spec: str) -> np.ndarray:
    if spec.startswith("pdf:"):
        name, page = spec[4:].split("#")
        doc = pymupdf.open(os.path.join(BRAND, name))
        img = doc[int(page) - 1].get_images(full=True)[0]
        pix = pymupdf.Pixmap(doc, img[0])
        if img[1]:
            pix = pymupdf.Pixmap(pix, pymupdf.Pixmap(doc, img[1]))
        arr = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
        return arr.astype(np.float32) / 255.0
    return load_rgba(os.path.join(BRAND, spec))


def plate_gradient(rgba: np.ndarray, mask: np.ndarray) -> dict:
    """Plashka gradienti: rang ~ chiziqli (x, y) — eng tez o'zgarish yo'nalishi bo'yicha ikki uch rangi."""
    ys, xs = np.nonzero(mask)
    cols = rgba[ys, xs, :3]
    a = np.stack([xs, ys, np.ones_like(xs)], axis=1).astype(np.float64)
    coef, *_ = np.linalg.lstsq(a, cols.astype(np.float64), rcond=None)
    lum = coef[:2, :].sum(axis=1)  # yorqinlik gradienti (x, y)
    direction = lum / (np.linalg.norm(lum) + 1e-12)
    proj = xs * direction[0] + ys * direction[1]
    lo, hi = np.percentile(proj, 1), np.percentile(proj, 99)
    cx, cy = xs.mean(), ys.mean()
    base = cx * direction[0] + cy * direction[1]
    p0 = (cx + (lo - base) * direction[0], cy + (lo - base) * direction[1])
    p1 = (cx + (hi - base) * direction[0], cy + (hi - base) * direction[1])

    def color_at(p):
        v = coef[0] * p[0] + coef[1] * p[1] + coef[2]
        return "#%02X%02X%02X" % tuple(int(round(max(0, min(1, c)) * 255)) for c in v)

    return {"x1": p0[0], "y1": p0[1], "x2": p1[0], "y2": p1[1], "c1": color_at(p0), "c2": color_at(p1)}


def trace(name: str, cfg: dict) -> dict:
    rgba = load_source(cfg["src"])
    alpha = rgba[:, :, 3]
    ys, xs = np.nonzero(alpha > 0.03)
    pad = 6
    x0, y0 = max(0, xs.min() - pad), max(0, ys.min() - pad)
    x1, y1 = min(rgba.shape[1], xs.max() + pad + 1), min(rgba.shape[0], ys.max() + pad + 1)
    rgba = rgba[y0:y1, x0:x1]
    cov = layer_coverage(rgba, cfg["palette"], cfg["order"], (int(x0), int(y0)))
    cov = {k: gaussian_blur(v, SIGMA) for k, v in cov.items()}
    ext = extend_under(cov, cfg["order"], EXTEND)
    parts = []
    for layer in cfg["order"]:
        loops = marching_squares(ext[layer], 0.5)
        for part in build_parts(layer, loops, MIN_AREA):
            d = ""
            for loop in [part.outer, *part.holes]:
                curves = loop_to_beziers(loop, ERROR, corner_k=4.0, corner_angle=40.0, smooth=3)
                d += beziers_to_d(curves)
            part.d = d
            parts.append(part)
    emblem_cfg = cfg.get("emblem")
    if emblem_cfg:
        parts = substitute_emblem(parts, emblem_cfg, rgba.shape[1], rgba.shape[0], name)
    if cfg.get("geometric_plate"):
        parts = geometric_plate(parts, cfg["geometric_plate"], rgba.shape[1], rgba.shape[0], name)
    gradient = None
    if any(v == "url(#g)" for v in cfg["fills"].values()):
        gradient = plate_gradient(rgba, (cov["plate"] > 0.9) & (cov.get("white", np.zeros_like(alpha[y0:y1, x0:x1])) < 0.05))
    return {
        "name": name,
        "width": int(x1 - x0),
        "height": int(y1 - y0),
        "order": cfg["order"],
        "fills": cfg["fills"],
        "gradient": gradient,
        "parts": [
            {
                "layer": p.layer,
                "bbox": [round(v, 1) for v in p.bbox],
                "area": round(p.area, 1),
                "d": p.d,
                **({"transform": p.transform, "emblem": p.emblem} if getattr(p, "transform", None) else {}),
            }
            for p in parts
        ],
        "_rgba": rgba,
    }


def _mask_svg(w: int, h: int, items: list) -> str:
    body = ""
    for d, t in items:
        tr = f' transform="{t}"' if t else ""
        body += f'<path d="{d}" fill="#000" fill-rule="evenodd"{tr}/>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">{body}</svg>'


def substitute_emblem(parts: list, cfg: dict, w: int, h: int, name: str) -> list:
    """Hududdagi qushcha qismlari o'rniga rasmiy emblema (o'lcham — chegara bo'yicha, markazga tekislab)."""
    x0, y0, x1, y1 = cfg["region"]
    picked = [p for p in parts if p.layer == cfg["layer"] and x0 <= p.center[0] <= x1 and y0 <= p.center[1] <= y1]
    if not picked:
        raise SystemExit(f"{name}: emblema hududida qism topilmadi")
    tb = np.array([min(p.bbox[0] for p in picked), min(p.bbox[1] for p in picked), max(p.bbox[2] for p in picked), max(p.bbox[3] for p in picked)])
    emblem = load_emblem()
    allp = np.concatenate([path_points(d) for d in emblem.values()])
    ob = np.array([allp[:, 0].min(), allp[:, 1].min(), allp[:, 0].max(), allp[:, 1].max()])
    base = float(np.sqrt(((tb[2] - tb[0]) / (ob[2] - ob[0])) * ((tb[3] - tb[1]) / (ob[3] - ob[1]))))
    a = render_svg(_mask_svg(w, h, [(p.d, "") for p in picked]), w, h)[:, :, 3] > 0.5

    def place(scale: float) -> tuple[float, float]:
        return (tb[0] + tb[2]) / 2 - scale * (ob[0] + ob[2]) / 2, (tb[1] + tb[3]) / 2 - scale * (ob[1] + ob[3]) / 2

    # Moslash: masshtab (7 qadam) × butun pikselli siljish (±8) — traced qushcha bilan IoU eng katta bo'lgani
    best = (-1.0, base, 0, 0)
    for factor in (0.97, 0.98, 0.99, 1.0, 1.01, 1.02, 1.03):
        scale = base * factor
        tx, ty = place(scale)
        b = render_svg(_mask_svg(w, h, [(d, f"matrix({scale:.5f} 0 0 {scale:.5f} {tx:.2f} {ty:.2f})") for d in emblem.values()]), w, h)[:, :, 3] > 0.5
        for dy in range(-8, 9):
            rb = np.roll(b, dy, axis=0)
            for dx in range(-8, 9):
                shifted = np.roll(rb, dx, axis=1)
                iou = float((a & shifted).sum() / max(1, (a | shifted).sum()))
                if iou > best[0]:
                    best = (iou, scale, dx, dy)
    iou, scale, dx, dy = best
    tx, ty = place(scale)
    tx, ty = tx + dx, ty + dy
    transform = f"matrix({scale:.5f} 0 0 {scale:.5f} {tx:.2f} {ty:.2f})"
    print(f"  {name}: emblema {len(picked)} qism -> rasmiy (scale {scale:.4f}, siljish {dx},{dy}, IoU {iou:.3f})")
    picked_ids = {id(p) for p in picked}
    out = [p for p in parts if id(p) not in picked_ids]
    for key, d in emblem.items():
        pts = path_points(d) * scale + np.array([tx, ty])
        part = Part(cfg["layer"], pts)
        part.d = d
        part.transform = transform
        part.emblem = key
        out.append(part)
    return out


def geometric_plate(parts: list, layer: str, w: int, h: int, name: str) -> list:
    """
    PLUS plashkasi — to'g'ri to'rtburchak, burchaklari alohida radiusli (brend: chap-yuqori va o'ng-past yumaloq).
    Har burchak radiusi traced shaklga moslab tanlanadi; plashka teshiksiz (oq harflar ustidan chiziladi).
    """
    plates = [p for p in parts if p.layer == layer]
    main = max(plates, key=lambda p: p.area)
    x0, y0, x1, y1 = main.bbox
    mask = render_svg(_mask_svg(w, h, [(main.d, "")]), w, h)[:, :, 3]
    # teshiklarni to'ldiramiz (harflar o'rni) — faqat tashqi shakl muhim
    outer_only = render_svg(_mask_svg(w, h, [(main.d.split("Z")[0] + "Z", "")]), w, h)[:, :, 3] > 0.5
    yy, xx = np.mgrid[0:h, 0:w]
    px, py = xx + 0.5, yy + 0.5

    def corner_iou(cx: str, cy: str, r: float) -> float:
        size = 70
        sx0 = x0 if cx == "l" else x1 - size
        sy0 = y0 if cy == "t" else y1 - size
        sl = (slice(int(max(0, sy0)), int(min(h, sy0 + size))), slice(int(max(0, sx0)), int(min(w, sx0 + size))))
        X, Y = px[sl], py[sl]
        inside = (X >= x0) & (X <= x1) & (Y >= y0) & (Y <= y1)
        ccx = x0 + r if cx == "l" else x1 - r
        ccy = y0 + r if cy == "t" else y1 - r
        in_corner = ((X - ccx) * (1 if cx == "r" else -1) > 0) & ((Y - ccy) * (1 if cy == "b" else -1) > 0)
        inside &= ~(in_corner & (((X - ccx) ** 2 + (Y - ccy) ** 2) > r * r))
        ref = outer_only[sl]
        return float((inside & ref).sum() / max(1, (inside | ref).sum()))

    radii = {}
    for key, (cx, cy) in {"tl": ("l", "t"), "tr": ("r", "t"), "br": ("r", "b"), "bl": ("l", "b")}.items():
        radii[key] = max(range(0, 64, 1), key=lambda r: corner_iou(cx, cy, float(r)))
    tl, tr, br, bl = (radii[k] for k in ("tl", "tr", "br", "bl"))
    f = lambda v: f"{v:.1f}".rstrip("0").rstrip(".")  # noqa: E731
    d = (
        f"M{f(x0 + tl)} {f(y0)}H{f(x1 - tr)}"
        + (f"A{tr} {tr} 0 0 1 {f(x1)} {f(y0 + tr)}" if tr else "")
        + f"V{f(y1 - br)}"
        + (f"A{br} {br} 0 0 1 {f(x1 - br)} {f(y1)}" if br else "")
        + f"H{f(x0 + bl)}"
        + (f"A{bl} {bl} 0 0 1 {f(x0)} {f(y1 - bl)}" if bl else "")
        + f"V{f(y0 + tl)}"
        + (f"A{tl} {tl} 0 0 1 {f(x0 + tl)} {f(y0)}" if tl else "")
        + "Z"
    )
    geo = render_svg(_mask_svg(w, h, [(d, "")]), w, h)[:, :, 3] > 0.5
    iou = float((geo & outer_only).sum() / max(1, (geo | outer_only).sum()))
    print(f"  {name}: plashka geometrik (radiuslar tl {tl}, tr {tr}, br {br}, bl {bl}; IoU {iou:.3f})")
    del mask
    plate = Part(layer, main.outer)
    plate.d = d
    return [p for p in parts if p.layer != layer] + [plate]


def to_svg(data: dict, fills: dict | None = None) -> str:
    fills = fills or data["fills"]
    w, h = data["width"], data["height"]
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">']
    g = data.get("gradient")
    if g:
        out.append(
            "<defs><linearGradient id=\"g\" gradientUnits=\"userSpaceOnUse\" "
            f'x1="{g["x1"]:.1f}" y1="{g["y1"]:.1f}" x2="{g["x2"]:.1f}" y2="{g["y2"]:.1f}">'
            f'<stop offset="0" stop-color="{g["c1"]}"/><stop offset="1" stop-color="{g["c2"]}"/></linearGradient></defs>'
        )
    for layer in data["order"]:
        ds = "".join(p["d"] for p in data["parts"] if p["layer"] == layer and not p.get("transform"))
        if ds:
            out.append(f'<path fill="{fills[layer]}" fill-rule="evenodd" d="{ds}"/>')
        emblem = [p for p in data["parts"] if p["layer"] == layer and p.get("transform")]
        if emblem:
            body = "".join(f'<path d="{p["d"]}"/>' for p in emblem)
            out.append(f'<g fill="{fills[layer]}" transform="{emblem[0]["transform"]}">{body}</g>')
    out.append("</svg>")
    return "".join(out)


def render_svg(svg_text: str, width: int, height: int) -> np.ndarray:
    """SVG ni librsvg (sharp) bilan chizish — MuPDF gradient fill'ni chizmaydi."""
    import subprocess
    import tempfile

    with tempfile.TemporaryDirectory() as tmp:
        src = os.path.join(tmp, "in.svg")
        dst = os.path.join(tmp, "out.raw")
        with open(src, "w", encoding="utf-8") as fh:
            fh.write(svg_text)
        script = (
            "const sharp=require('sharp');"
            f"sharp({json.dumps(src)}).resize({width},{height},{{fit:'fill'}}).ensureAlpha().raw().toBuffer()"
            f".then(b=>{{require('fs').writeFileSync({json.dumps(dst)},b);process.exit(0)}}).catch(e=>{{console.error(e);process.exit(1)}})"
        )
        subprocess.run(["node", "-e", script], check=True, cwd=ROOT)
        raw = np.fromfile(dst, dtype=np.uint8)
    return raw.reshape(height, width, 4).astype(np.float32) / 255.0


def compare(data: dict, svg_text: str) -> dict:
    """SVG ni manba o'lchamida chizib, alfa farqini o'lchaymiz."""
    rgba = data["_rgba"]
    got = render_svg(svg_text, data["width"], data["height"])
    a_src, a_got = rgba[:, :, 3], got[:, :, 3]
    diff = np.abs(a_src - a_got)
    iou = float(((a_src > 0.5) & (a_got > 0.5)).sum() / max(1, ((a_src > 0.5) | (a_got > 0.5)).sum()))
    return {"alpha_mae": round(float(diff.mean()), 5), "alpha_bad_px": int((diff > 0.5).sum()), "iou": round(iou, 5)}


def main() -> None:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    out_dir = None
    if "--out" in sys.argv:
        out_dir = sys.argv[sys.argv.index("--out") + 1]
        args = [a for a in args if a != out_dir]
    names = args or list(LOGOS.keys())
    svg_dir = out_dir or os.path.join(BRAND, "svg")
    json_dir = out_dir or os.path.join(ROOT, "scripts", ".trace")
    os.makedirs(svg_dir, exist_ok=True)
    os.makedirs(json_dir, exist_ok=True)
    for name in names:
        data = trace(name, LOGOS[name])
        svg = to_svg(data)
        stats = compare(data, svg)
        with open(os.path.join(svg_dir, f"{name}.svg"), "w", encoding="utf-8") as fh:
            fh.write(svg)
        data.pop("_rgba")
        with open(os.path.join(json_dir, f"{name}.json"), "w", encoding="utf-8") as fh:
            json.dump(data, fh, ensure_ascii=False)
        layers = {}
        for p in data["parts"]:
            layers[p["layer"]] = layers.get(p["layer"], 0) + 1
        print(f"{name}: {data['width']}x{data['height']} parts={layers} svg={len(svg) // 1024}KB {stats}")


if __name__ == "__main__":
    main()
