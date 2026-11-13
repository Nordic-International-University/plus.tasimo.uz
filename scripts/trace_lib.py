"""
PNG logotipni vektorga aylantirish (faqat numpy + PyMuPDF; potrace kerak emas).

Bosqichlar:
  1. Rang qatlamlari: har piksel eng yaqin ikki palitra rangi orasida chiziqli ajratiladi (antialias chegaralari ham
     to'g'ri bo'linadi) → har qatlam uchun «qoplama» maydoni (0..1, alfa bilan).
  2. Pastki qatlamlar ustidagi qatlamlar ostiga bir necha piksel kengaytiriladi — qatlamlar orasida tirqish qolmaydi.
  3. Marching squares (0.5 sathi) → subpiksel aniqlikdagi yopiq konturlar (ichki qism doim chap tomonda).
  4. Burchaklar topiladi (k va 2k masofadagi burilish solishtiriladi — silliq yoy burchak deb olinmaydi),
     burchaklar orasidagi nuqtalarga kubik Bézier egri chiziqlari moslanadi (Schneider algoritmi).
  5. Kontur ichma-ich joylashuvi bo'yicha «qismlar»ga (tashqi kontur + teshiklar) yig'iladi — animatsiya guruhlari uchun.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field

import numpy as np
import pymupdf


# ───────────────────────────── kirish ─────────────────────────────


def load_rgba(path: str) -> np.ndarray:
    pix = pymupdf.Pixmap(path)
    if pix.alpha == 0:
        pix = pymupdf.Pixmap(pix, 1)
    if pix.n != 4:
        pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
    arr = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
    return arr.astype(np.float32) / 255.0


def gaussian_blur(field_: np.ndarray, sigma: float) -> np.ndarray:
    if sigma <= 0:
        return field_
    radius = max(1, int(math.ceil(sigma * 3)))
    xs = np.arange(-radius, radius + 1, dtype=np.float32)
    kernel = np.exp(-(xs**2) / (2 * sigma * sigma))
    kernel /= kernel.sum()
    out = field_
    for axis in (0, 1):
        padded = np.pad(out, [(radius, radius) if a == axis else (0, 0) for a in (0, 1)], mode="edge")
        acc = np.zeros_like(out)
        for i, weight in enumerate(kernel):
            sl = [slice(None), slice(None)]
            sl[axis] = slice(i, i + out.shape[axis])
            acc += weight * padded[tuple(sl)]
        out = acc
    return out


def max_filter(field_: np.ndarray, radius: int) -> np.ndarray:
    out = field_.copy()
    for _ in range(radius):
        shifted = out.copy()
        shifted[1:, :] = np.maximum(shifted[1:, :], out[:-1, :])
        shifted[:-1, :] = np.maximum(shifted[:-1, :], out[1:, :])
        shifted[:, 1:] = np.maximum(shifted[:, 1:], out[:, :-1])
        shifted[:, :-1] = np.maximum(shifted[:, :-1], out[:, 1:])
        out = shifted
    return out


def layer_coverage(rgba: np.ndarray, palette: list, layers: list[str], offset: tuple[int, int] = (0, 0)) -> dict[str, np.ndarray]:
    """
    Har qatlam qoplamasi: alfa × (piksel rangini eng yaqin ikki palitra rangi orasida chiziqli ajratish).
    Palitra elementi: (rang, qatlam) yoki (rang, qatlam, (x0, y0, x1, y1)) — rang faqat shu hududda (manba koordinatasi)
    qatnashadi: uchta rang bir chiziqda yotsa (to'q → o'rta → och), chegara piksellari o'rta rangga yopishib qolmasin.
    """
    rgb = rgba[:, :, :3]
    alpha = rgba[:, :, 3]
    colors = np.array([np.array(entry[0], dtype=np.float32) / 255.0 for entry in palette])  # (k,3)
    owner = [layers.index(entry[1]) for entry in palette]
    h, w = alpha.shape
    flat = rgb.reshape(-1, 3)
    dist = ((flat[:, None, :] - colors[None, :, :]) ** 2).sum(axis=2)  # (n,k)
    yy, xx = np.mgrid[0:h, 0:w]
    xx = (xx + offset[0]).reshape(-1)
    yy = (yy + offset[1]).reshape(-1)
    for k, entry in enumerate(palette):
        if len(entry) > 2 and entry[2] is not None:
            region = entry[2]
            deny = isinstance(region[0], str) and region[0] == "not"
            x0, y0, x1, y1 = region[1] if deny else region
            inside = (xx >= x0) & (xx <= x1) & (yy >= y0) & (yy <= y1)
            dist[inside if deny else ~inside, k] = 1e9
    order = np.argsort(dist, axis=1)
    i1, i2 = order[:, 0], order[:, 1]
    p1, p2 = colors[i1], colors[i2]
    seg = p2 - p1
    denom = np.maximum((seg**2).sum(axis=1), 1e-6)
    t = np.clip(((flat - p1) * seg).sum(axis=1) / denom, 0.0, 1.0)
    weights = np.zeros((flat.shape[0], len(layers)), dtype=np.float32)
    rows = np.arange(flat.shape[0])
    np.add.at(weights, (rows, np.array(owner)[i1]), 1.0 - t)
    np.add.at(weights, (rows, np.array(owner)[i2]), t)
    out = {}
    for index, name in enumerate(layers):
        out[name] = (weights[:, index].reshape(h, w) * alpha).astype(np.float32)
    return out


def extend_under(cov: dict[str, np.ndarray], order: list[str], radius: int) -> dict[str, np.ndarray]:
    """Pastki qatlamni ustidagi qatlamlar ostiga `radius` piksel kengaytirish (qatlamlar orasida tirqish bo'lmasin)."""
    out = {}
    for index, name in enumerate(order):
        upper = np.zeros_like(cov[name])
        for other in order[index + 1 :]:
            upper = upper + cov[other]
        upper = np.minimum(upper, 1.0)
        near = max_filter(cov[name], radius)
        out[name] = np.maximum(cov[name], np.minimum(upper, near))
    return out


# ───────────────────────────── marching squares ─────────────────────────────

# Ichki qism (qiymat > sath) yurish yo'nalishining chap tomonida (ekran koordinatalari, y pastga).
# Burchak bitlari: TL=8, TR=4, BR=2, BL=1. Qirralar: T, R, B, L.
_CASES = {
    1: [("B", "L")],
    2: [("R", "B")],
    3: [("R", "L")],
    4: [("T", "R")],
    6: [("T", "B")],
    7: [("T", "L")],
    8: [("L", "T")],
    9: [("B", "T")],
    11: [("R", "T")],
    12: [("L", "R")],
    13: [("B", "R")],
    14: [("L", "B")],
}


def marching_squares(field_: np.ndarray, level: float = 0.5) -> list[np.ndarray]:
    f = np.pad(field_, 1, mode="constant", constant_values=0.0)
    h, w = f.shape
    above = f > level
    tl, tr = above[:-1, :-1], above[:-1, 1:]
    br, bl = above[1:, 1:], above[1:, :-1]
    case = tl * 8 + tr * 4 + br * 2 + bl * 1
    ys, xs = np.nonzero((case != 0) & (case != 15))

    def edge_key(y: int, x: int, edge: str) -> tuple[str, int, int]:
        if edge == "T":
            return ("h", y, x)
        if edge == "B":
            return ("h", y + 1, x)
        if edge == "L":
            return ("v", y, x)
        return ("v", y, x + 1)

    nxt: dict[tuple[str, int, int], tuple[str, int, int]] = {}
    for y, x in zip(ys.tolist(), xs.tolist()):
        c = int(case[y, x])
        if c == 5 or c == 10:
            center = (f[y, x] + f[y, x + 1] + f[y + 1, x] + f[y + 1, x + 1]) / 4.0
            joined = center > level
            if c == 5:
                segs = [("T", "L"), ("B", "R")] if joined else [("B", "L"), ("T", "R")]
            else:
                segs = [("R", "T"), ("L", "B")] if joined else [("L", "T"), ("R", "B")]
        else:
            segs = _CASES[c]
        for a, b in segs:
            nxt[edge_key(y, x, a)] = edge_key(y, x, b)

    def point(key: tuple[str, int, int]) -> tuple[float, float]:
        kind, y, x = key
        if kind == "h":
            a, b = f[y, x], f[y, x + 1]
            s = (level - a) / (b - a) if b != a else 0.5
            return (x + s - 1.0, y - 1.0)
        a, b = f[y, x], f[y + 1, x]
        s = (level - a) / (b - a) if b != a else 0.5
        return (x - 1.0, y + s - 1.0)

    loops = []
    seen: set = set()
    for start in list(nxt.keys()):
        if start in seen:
            continue
        pts = []
        key = start
        while key not in seen:
            seen.add(key)
            pts.append(point(key))
            key = nxt.get(key)
            if key is None:
                break
        if len(pts) >= 3:
            loops.append(np.array(pts, dtype=np.float64))
    return loops


def signed_area(poly: np.ndarray) -> float:
    x, y = poly[:, 0], poly[:, 1]
    return 0.5 * float(np.dot(x, np.roll(y, -1)) - np.dot(np.roll(x, -1), y))


def point_in_poly(pt: tuple[float, float], poly: np.ndarray) -> bool:
    x, y = pt
    xs, ys = poly[:, 0], poly[:, 1]
    xj, yj = np.roll(xs, 1), np.roll(ys, 1)
    cond = ((ys > y) != (yj > y)) & (x < (xj - xs) * (y - ys) / np.where(yj - ys == 0, 1e-12, yj - ys) + xs)
    return bool(np.count_nonzero(cond) % 2)


# ───────────────────────────── egri chiziq moslash ─────────────────────────────


def _resample_index(cum: np.ndarray, i: int, dist: float, sign: int) -> int:
    target = cum[i] + sign * dist
    j = int(np.searchsorted(cum, target))
    return max(0, min(len(cum) - 1, j))


def find_corners(poly: np.ndarray, k: float = 3.5, min_angle: float = 40.0) -> list[int]:
    """Burchak: k masofadagi burilish katta va 2k dagisidan deyarli farq qilmaydi (silliq yoyda 2k ≈ 2×k)."""
    n = len(poly)
    if n < 8:
        return []
    ext = np.concatenate([poly[-n // 2 :], poly, poly[: n // 2]])
    seglen = np.linalg.norm(np.diff(ext, axis=0), axis=1)
    cum = np.concatenate([[0.0], np.cumsum(seglen)])
    offset = n // 2

    def turn(i: int, dist: float) -> float:
        a = _resample_index(cum, i, dist, -1)
        b = _resample_index(cum, i, dist, +1)
        v1 = ext[i] - ext[a]
        v2 = ext[b] - ext[i]
        n1, n2 = np.linalg.norm(v1), np.linalg.norm(v2)
        if n1 < 1e-9 or n2 < 1e-9:
            return 0.0
        cosv = float(np.clip(np.dot(v1, v2) / (n1 * n2), -1.0, 1.0))
        return math.degrees(math.acos(cosv))

    angles = np.array([turn(i + offset, k) for i in range(n)])
    wide = np.array([turn(i + offset, 2 * k) for i in range(n)])
    cand = (angles > min_angle) & (angles > 0.62 * wide)
    corners = []
    window = max(2, int(k * 1.5))
    for i in np.nonzero(cand)[0].tolist():
        lo, hi = i - window, i + window + 1
        idx = [(j % n) for j in range(lo, hi)]
        if angles[i] >= max(angles[idx]) - 1e-9:
            if not corners or (i - corners[-1]) > window:
                corners.append(i)
    if len(corners) >= 2 and (corners[0] + n - corners[-1]) <= window:
        if angles[corners[0]] >= angles[corners[-1]]:
            corners.pop()
        else:
            corners.pop(0)
    return corners


def _bezier(ctrl: np.ndarray, t: np.ndarray) -> np.ndarray:
    mt = 1 - t
    return (
        (mt**3)[:, None] * ctrl[0]
        + (3 * mt * mt * t)[:, None] * ctrl[1]
        + (3 * mt * t * t)[:, None] * ctrl[2]
        + (t**3)[:, None] * ctrl[3]
    )


def _bezier_d1(ctrl: np.ndarray, t: np.ndarray) -> np.ndarray:
    mt = 1 - t
    return (
        (3 * mt * mt)[:, None] * (ctrl[1] - ctrl[0])
        + (6 * mt * t)[:, None] * (ctrl[2] - ctrl[1])
        + (3 * t * t)[:, None] * (ctrl[3] - ctrl[2])
    )


def _bezier_d2(ctrl: np.ndarray, t: np.ndarray) -> np.ndarray:
    mt = 1 - t
    return (6 * mt)[:, None] * (ctrl[2] - 2 * ctrl[1] + ctrl[0]) + (6 * t)[:, None] * (ctrl[3] - 2 * ctrl[2] + ctrl[1])


def _chord_params(pts: np.ndarray) -> np.ndarray:
    d = np.concatenate([[0.0], np.cumsum(np.linalg.norm(np.diff(pts, axis=0), axis=1))])
    return d / d[-1] if d[-1] > 0 else np.linspace(0, 1, len(pts))


def _generate(pts: np.ndarray, u: np.ndarray, tan1: np.ndarray, tan2: np.ndarray) -> np.ndarray:
    p0, p3 = pts[0], pts[-1]
    a1 = np.outer(3 * (1 - u) ** 2 * u, tan1)
    a2 = np.outer(3 * (1 - u) * u**2, tan2)
    c00 = float((a1 * a1).sum())
    c01 = float((a1 * a2).sum())
    c11 = float((a2 * a2).sum())
    base = np.outer((1 - u) ** 3 + 3 * (1 - u) ** 2 * u, p0) + np.outer(3 * (1 - u) * u**2 + u**3, p3)
    tmp = pts - base
    x0 = float((a1 * tmp).sum())
    x1 = float((a2 * tmp).sum())
    det = c00 * c11 - c01 * c01
    seg = float(np.linalg.norm(p3 - p0))
    eps = 1e-6 * max(seg, 1.0)
    if abs(det) > 1e-12:
        al = (x0 * c11 - x1 * c01) / det
        ar = (c00 * x1 - c01 * x0) / det
    else:
        al = ar = seg / 3.0
    if al < eps or ar < eps or al > seg * 2.5 or ar > seg * 2.5:
        al = ar = seg / 3.0
    return np.array([p0, p0 + tan1 * al, p3 + tan2 * ar, p3])


def _max_error(pts: np.ndarray, ctrl: np.ndarray, u: np.ndarray) -> tuple[float, int]:
    d = np.linalg.norm(_bezier(ctrl, u) - pts, axis=1)
    i = int(np.argmax(d))
    if i == 0:
        i = 1
    if i == len(pts) - 1:
        i = len(pts) - 2
    return float(d.max()), i


def _reparam(pts: np.ndarray, ctrl: np.ndarray, u: np.ndarray) -> np.ndarray:
    q = _bezier(ctrl, u) - pts
    d1 = _bezier_d1(ctrl, u)
    d2 = _bezier_d2(ctrl, u)
    num = (q * d1).sum(axis=1)
    den = (d1 * d1).sum(axis=1) + (q * d2).sum(axis=1)
    with np.errstate(divide="ignore", invalid="ignore"):
        nu = np.where(np.abs(den) > 1e-12, u - num / den, u)
    nu = np.clip(nu, 0.0, 1.0)
    nu[0], nu[-1] = 0.0, 1.0
    return np.maximum.accumulate(nu)


def _unit(v: np.ndarray) -> np.ndarray:
    n = float(np.linalg.norm(v))
    return v / n if n > 1e-12 else v


def fit_curve(pts: np.ndarray, tan1: np.ndarray, tan2: np.ndarray, error: float, depth: int = 0) -> list[np.ndarray]:
    if len(pts) == 2 or depth > 24:
        seg = float(np.linalg.norm(pts[-1] - pts[0])) / 3.0
        return [np.array([pts[0], pts[0] + tan1 * seg, pts[-1] + tan2 * seg, pts[-1]])]
    u = _chord_params(pts)
    ctrl = _generate(pts, u, tan1, tan2)
    err, split = _max_error(pts, ctrl, u)
    if err < error:
        return [ctrl]
    if err < error * 6:
        for _ in range(12):
            u = _reparam(pts, ctrl, u)
            ctrl = _generate(pts, u, tan1, tan2)
            err, split = _max_error(pts, ctrl, u)
            if err < error:
                return [ctrl]
    center = _unit(pts[split - 1] - pts[split + 1])
    if not np.any(center):
        center = _unit(pts[split - 1] - pts[split])
    left = fit_curve(pts[: split + 1], tan1, center, error, depth + 1)
    right = fit_curve(pts[split:], -center, tan2, error, depth + 1)
    return left + right


def _smooth_open(pts: np.ndarray, rounds: int) -> np.ndarray:
    out = pts.copy()
    for _ in range(rounds):
        if len(out) < 3:
            break
        inner = (out[:-2] + 2 * out[1:-1] + out[2:]) / 4.0
        out = np.concatenate([out[:1], inner, out[-1:]])
    return out


def _tangent(pts: np.ndarray, forward: bool, span: float = 2.5) -> np.ndarray:
    """Uchdagi yo'nalish: bir necha piksel masofadagi nuqtaga qarab (shovqinga chidamli)."""
    seq = pts if forward else pts[::-1]
    base = seq[0]
    acc = 0.0
    for i in range(1, len(seq)):
        acc += float(np.linalg.norm(seq[i] - seq[i - 1]))
        if acc >= span:
            return _unit(seq[i] - base)
    return _unit(seq[-1] - base)


def _dp_indices(pts: np.ndarray, tol: float) -> list[int]:
    """Douglas–Peucker: soddalashtirilgan siniq chiziq uchlari (indekslar)."""
    keep = [0, len(pts) - 1]
    stack = [(0, len(pts) - 1)]
    while stack:
        a, b = stack.pop()
        if b - a < 2:
            continue
        chord = pts[b] - pts[a]
        clen = float(np.linalg.norm(chord))
        seg = pts[a + 1 : b]
        if clen < 1e-9:
            dev = np.linalg.norm(seg - pts[a], axis=1)
        else:
            dev = np.abs((seg - pts[a]) @ np.array([-chord[1], chord[0]]) / clen)
        i = int(np.argmax(dev))
        if float(dev[i]) > tol:
            m = a + 1 + i
            keep.append(m)
            stack.append((a, m))
            stack.append((m, b))
    return sorted(set(keep))


def _line(p: np.ndarray, q: np.ndarray) -> np.ndarray:
    return np.array([p, p + (q - p) / 3, q - (q - p) / 3, q])


def _fit_span(pts: np.ndarray, tan_start: np.ndarray, tan_end: np.ndarray, error: float, straight_tol: float, min_run: float) -> list[np.ndarray]:
    """
    Burchaklar orasidagi bo'lak: uzun to'g'ri qismlar (DP kesmasi ≥ min_run, nuqtalar ≤ straight_tol) aniq to'g'ri chiziq,
    qolgani — Bézier, to'g'ri qismga urinma bo'ylab silliq (G1) ulanadi. Shovqinli manbada ustun va chiziqlar to'g'ri chiqadi.
    tan_start — boshda oldinga, tan_end — oxirda orqaga qaragan birlik vektor.
    """
    if len(pts) < 3:
        return [_line(pts[0], pts[-1])]
    idx = _dp_indices(pts, straight_tol)
    runs = []
    for a, b in zip(idx, idx[1:]):
        if float(np.linalg.norm(pts[b] - pts[a])) >= min_run:
            runs.append((a, b))
    if not runs:
        return fit_curve(pts, tan_start, tan_end, error)
    out: list[np.ndarray] = []
    pos = 0
    t_in = tan_start
    for a, b in runs:
        direction = _unit(pts[b] - pts[a])
        if a > pos:
            piece = pts[pos : a + 1]
            if len(piece) < 3:
                out.append(_line(piece[0], piece[-1]))
            else:
                out.extend(fit_curve(piece, t_in, -direction, error))
        out.append(_line(pts[a], pts[b]))
        t_in = direction
        pos = b
    if pos < len(pts) - 1:
        piece = pts[pos:]
        if len(piece) < 3:
            out.append(_line(piece[0], piece[-1]))
        else:
            out.extend(fit_curve(piece, t_in, tan_end, error))
    return out


def loop_to_beziers(poly: np.ndarray, error: float, corner_k: float, corner_angle: float, smooth: int, straight_tol: float = 0.7, min_run: float = 28.0) -> list[np.ndarray]:
    corners = find_corners(poly, corner_k, corner_angle)
    n = len(poly)
    if not corners:
        # Burchaksiz kontur (halqa, yumaloq burchakli plashka): eng uzun to'g'ri qism o'rtasidan boshlaymiz (bo'lmasa — 0)
        sm = _smooth_open(np.concatenate([poly[-4:], poly, poly[:4]]), smooth)[4:-4]
        idx = _dp_indices(np.concatenate([sm, sm[:1]]), straight_tol)
        best, start = 0.0, 0
        for a, b in zip(idx, idx[1:]):
            length = float(np.linalg.norm(sm[b % n] - sm[a % n]))
            if length > best:
                best, start = length, ((a + b) // 2) % n
        order = list(range(start, n)) + list(range(0, start)) + [start]
        pts = sm[order]
        tan = _unit(sm[(start + 2) % n] - sm[(start - 2) % n])
        return _fit_span(pts, tan, -tan, error, straight_tol, min_run)
    curves: list[np.ndarray] = []
    for ci, c0 in enumerate(corners):
        c1 = corners[(ci + 1) % len(corners)]
        if c1 <= c0:
            idx = list(range(c0, n)) + list(range(0, c1 + 1))
        else:
            idx = list(range(c0, c1 + 1))
        pts = poly[idx]
        if len(pts) < 2:
            continue
        pts = _smooth_open(pts, smooth)
        # Bitta burchakli kontur (masalan, uchli dumli yorliq): boshi va oxiri bir nuqta — bu to'liq aylana, kesma emas
        if len(pts) == 2:
            curves.append(_line(pts[0], pts[-1]))
            continue
        # Burchaklar orasidagi deyarli to'g'ri chiziq — bitta to'g'ri kesma
        chord = pts[-1] - pts[0]
        clen = float(np.linalg.norm(chord))
        if clen > 1e-6:
            normal = np.array([-chord[1], chord[0]]) / clen
            dev = np.abs((pts - pts[0]) @ normal)
            # uzun chiziqda shovqin bir-ikki pikselga yetadi — nisbiy tolerans (haqiqiy katta yoyning egiligi ancha katta)
            if float(dev.max()) < max(error * 1.35, 1.1, 0.0035 * clen):
                curves.append(_line(pts[0], pts[-1]))
                continue
        curves.extend(_fit_span(pts, _tangent(pts, True), _tangent(pts, False), error, straight_tol, min_run))
    return curves


def fmt(v: float) -> str:
    s = f"{v:.1f}"
    if s.endswith(".0"):
        s = s[:-2]
    if s == "-0":
        s = "0"
    return s


def beziers_to_d(curves: list[np.ndarray], ox: float = 0.0, oy: float = 0.0) -> str:
    if not curves:
        return ""
    parts = [f"M{fmt(curves[0][0][0] - ox)} {fmt(curves[0][0][1] - oy)}"]
    for c in curves:
        straight = np.allclose(c[1], c[0] + (c[3] - c[0]) / 3, atol=0.05) and np.allclose(c[2], c[3] - (c[3] - c[0]) / 3, atol=0.05)
        if straight or (np.allclose(c[0], c[1]) and np.allclose(c[2], c[3])):
            parts.append(f"L{fmt(c[3][0] - ox)} {fmt(c[3][1] - oy)}")
        else:
            parts.append(
                "C" + " ".join(f"{fmt(p[0] - ox)} {fmt(p[1] - oy)}" for p in (c[1], c[2], c[3]))
            )
    parts.append("Z")
    return "".join(parts)


# ───────────────────────────── qismlar ─────────────────────────────


@dataclass
class Part:
    layer: str
    outer: np.ndarray
    holes: list[np.ndarray] = field(default_factory=list)
    d: str = ""

    @property
    def bbox(self) -> tuple[float, float, float, float]:
        return (
            float(self.outer[:, 0].min()),
            float(self.outer[:, 1].min()),
            float(self.outer[:, 0].max()),
            float(self.outer[:, 1].max()),
        )

    @property
    def area(self) -> float:
        return abs(signed_area(self.outer)) - sum(abs(signed_area(h)) for h in self.holes)

    @property
    def center(self) -> tuple[float, float]:
        x0, y0, x1, y1 = self.bbox
        return ((x0 + x1) / 2, (y0 + y1) / 2)


def build_parts(layer: str, loops: list[np.ndarray], min_area: float) -> list[Part]:
    loops = [lp for lp in loops if abs(signed_area(lp)) >= min_area]
    if not loops:
        return []
    # Tashqi konturlarning yo'nalishi bir xil: eng katta konturning ishorasi «tashqi»
    biggest = max(loops, key=lambda lp: abs(signed_area(lp)))
    outer_sign = 1 if signed_area(biggest) > 0 else -1
    outers = [lp for lp in loops if (signed_area(lp) > 0) == (outer_sign > 0)]
    holes = [lp for lp in loops if (signed_area(lp) > 0) != (outer_sign > 0)]
    parts = [Part(layer, o) for o in outers]
    parts.sort(key=lambda p: abs(signed_area(p.outer)))
    for hole in holes:
        probe = tuple(hole[0])
        owner = None
        for p in parts:  # eng kichik o'z ichiga olgan tashqi kontur
            if abs(signed_area(p.outer)) > abs(signed_area(hole)) and point_in_poly(probe, p.outer):
                owner = p
                break
        if owner is not None:
            owner.holes.append(hole)
    return parts


# ───────────────────────────── SVG path (rasmiy emblema uchun) ─────────────────────────────


def path_points(d: str, samples: int = 12) -> np.ndarray:
    """SVG path ma'lumotidan nuqtalar (chegarani hisoblash uchun): M L H V C S Q T Z, nisbiy va absolyut."""
    import re

    tokens = re.findall(r"[MmLlHhVvCcSsQqTtZz]|-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?", d)
    pts: list[tuple[float, float]] = []
    i = 0
    cmd = ""
    x = y = 0.0
    sx = sy = 0.0
    last_ctrl = None

    def num() -> float:
        nonlocal i
        v = float(tokens[i])
        i += 1
        return v

    def cubic(p0, p1, p2, p3):
        for t in np.linspace(0, 1, samples):
            mt = 1 - t
            pts.append((mt**3 * p0[0] + 3 * mt * mt * t * p1[0] + 3 * mt * t * t * p2[0] + t**3 * p3[0],
                        mt**3 * p0[1] + 3 * mt * mt * t * p1[1] + 3 * mt * t * t * p2[1] + t**3 * p3[1]))

    while i < len(tokens):
        if re.match(r"[A-Za-z]", tokens[i]):
            cmd = tokens[i]
            i += 1
            if cmd in "Zz":
                x, y = sx, sy
                pts.append((x, y))
                last_ctrl = None
                continue
        rel = cmd.islower()
        c = cmd.upper()
        if c == "M":
            nx, ny = num(), num()
            x, y = (x + nx, y + ny) if rel else (nx, ny)
            sx, sy = x, y
            pts.append((x, y))
            cmd = "l" if rel else "L"
            last_ctrl = None
        elif c == "L":
            nx, ny = num(), num()
            x, y = (x + nx, y + ny) if rel else (nx, ny)
            pts.append((x, y))
            last_ctrl = None
        elif c == "H":
            nx = num()
            x = x + nx if rel else nx
            pts.append((x, y))
            last_ctrl = None
        elif c == "V":
            ny = num()
            y = y + ny if rel else ny
            pts.append((x, y))
            last_ctrl = None
        elif c == "C":
            v = [num() for _ in range(6)]
            if rel:
                v = [v[0] + x, v[1] + y, v[2] + x, v[3] + y, v[4] + x, v[5] + y]
            cubic((x, y), (v[0], v[1]), (v[2], v[3]), (v[4], v[5]))
            last_ctrl = (v[2], v[3])
            x, y = v[4], v[5]
        elif c == "S":
            v = [num() for _ in range(4)]
            if rel:
                v = [v[0] + x, v[1] + y, v[2] + x, v[3] + y]
            c1 = (2 * x - last_ctrl[0], 2 * y - last_ctrl[1]) if last_ctrl else (x, y)
            cubic((x, y), c1, (v[0], v[1]), (v[2], v[3]))
            last_ctrl = (v[0], v[1])
            x, y = v[2], v[3]
        elif c == "Q":
            v = [num() for _ in range(4)]
            if rel:
                v = [v[0] + x, v[1] + y, v[2] + x, v[3] + y]
            p0, p1, p2 = (x, y), (v[0], v[1]), (v[2], v[3])
            cubic(p0, (p0[0] + 2 / 3 * (p1[0] - p0[0]), p0[1] + 2 / 3 * (p1[1] - p0[1])),
                  (p2[0] + 2 / 3 * (p1[0] - p2[0]), p2[1] + 2 / 3 * (p1[1] - p2[1])), p2)
            last_ctrl = None
            x, y = v[2], v[3]
        elif c == "T":
            nx, ny = num(), num()
            x, y = (x + nx, y + ny) if rel else (nx, ny)
            pts.append((x, y))
            last_ctrl = None
        else:
            raise ValueError(f"path: qo'llab-quvvatlanmaydigan buyruq {cmd}")
    return np.array(pts, dtype=np.float64)
