# Regenerates src/data/catalog.json from the live ANVEDA catalog (embedded #data JSON)
# and downloads every colourway photo into public/img/products/.
import json, re, os, sys, urllib.request, hashlib

SRC = "https://anveda.anveda-in.workers.dev/catalog"
PHOTO = "https://anveda.anveda-in.workers.dev/catalog/photo/"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMGDIR = os.path.join(ROOT, "public", "img", "products")
OUT = os.path.join(ROOT, "src", "data", "catalog.json")

def slug(s):
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", s.lower())).strip("-")

def title(s):
    small = {"and","or","of","the","with","non"}
    ws = s.split()
    return " ".join(w.capitalize() if (i == 0 or w.lower() not in small) else w.lower()
                    for i, w in enumerate(ws))

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    return urllib.request.urlopen(req, timeout=60).read()

print("fetching catalog…")
html = fetch(SRC).decode("utf-8", "replace")
m = re.search(r'<script[^>]*id=["\']data["\'][^>]*>(.*?)</script>', html, re.S)
data = json.loads(m.group(1))
fams, sw = data["f"], data.get("sw", {})

# Editorial copy per family. Anything not listed falls back to a generated line.
BLURB = {
 "Border Bangles": "Glass bangles finished with a worked border — kundan, pearl or set stone.",
 "Intricate Glass Bangle": "Fine-cut glass with a hand-set sparkle that catches every light in the room.",
 "Jelly Bangles - Glass Bangles": "Translucent jelly-finish glass in clean, saturated colour.",
 "Pastel Palette Glass Bangle": "Soft, powdery shades made to be stacked and layered.",
 "Petal Stone Glass Bangle": "Petal-set stones running the full round of the bangle.",
 "Phool Glass Bangle": "A floral motif worked into the glass, shade by shade.",
 "Statement Bangles": "The wide, worked pieces — the one you build the rest of the stack around.",
 "Kada": "Broad, solid kada with weight to it. Worn one to a wrist.",
 "Designer Side Bangles": "Slim side bangles designed to flank a statement piece.",
 "Gunghroo": "Bangles strung with fine gunghroo bells that sound as you move.",
 "Square Edge Glass Bangles": "A squared profile that sits flat and reads sharp against round bangles.",
}
STORY = {
 "Border Bangles": "The border is where the work shows. Kundan set by hand, pearl-and-gold stone, or the premium non-bendable stones — the body stays plain so the edge can carry the piece.",
 "Intricate Glass Bangle": "Our most detailed glass work — each bangle cut and set so the light breaks across it rather than sitting flat.",
 "Jelly Bangles - Glass Bangles": "Clear, candy-bright glass with nothing else going on. They stack with everything, which is exactly the point.",
 "Pastel Palette Glass Bangle": "Built as a palette rather than single colours — every shade in the range is made to sit next to every other one.",
 "Petal Stone Glass Bangle": "Stones set petal-wise around the full round, so the bangle keeps catching light from whatever angle you see it.",
 "Phool Glass Bangle": "Phool — flower. The motif is worked into the glass itself, so it holds its colour and never lifts.",
 "Statement Bangles": "The widest, most worked pieces we carry. One of these and a few slim side bangles is a full stack.",
 "Kada": "Traditionally worn singly and meant to have weight. Solid through, with the finish carried right around.",
 "Designer Side Bangles": "Made to flank, not to lead. Slim profiles that frame a statement piece without competing with it.",
 "Gunghroo": "Strung with fine bells, so the stack announces itself before you do. A festival piece.",
 "Square Edge Glass Bangles": "A squared edge instead of a round one. It sits flatter on the wrist and gives a stack a harder, more graphic line.",
}

# ------------------------------------------------------------------ groups
# The catalogue's own top-level grouping, taken verbatim from the regexes in
# the ANVEDA catalog page (filterCatalog(), the all-glass / all-ornate /
# all-layering branches). Kept as the same patterns rather than a hand-written
# family list so a NEW family lands in the right group automatically.
#
#   Glass    - Square Edge, Pastel Palette, Intricate, Petal Stone, Jelly, Phool
#   Ornate   - Designer Side, Statement, Kada
#   Layering - Border, Ghunghroo
GROUPS = [
    {
        "slug": "glass",
        "name": "Glass Bangles",
        "blurb": "Coloured glass, from clear jelly to cut and stone-set work.",
        "match": r"Square Edge|Pastel|Intricate|Petal Stone|Jelly|Phool",
    },
    {
        "slug": "ornate",
        "name": "Ornate Bangles",
        "blurb": "The worked pieces — statement bangles, kada and designer sides.",
        "match": r"Designer Side|Statement|Kada",
    },
    {
        "slug": "layering",
        "name": "Layering Bangles",
        "blurb": "Slim pieces made to sit either side of a statement bangle.",
        "match": r"Border|Ghunghroo|Gunghroo",
    },
]


def group_for(family_name):
    """Which top-level group a family belongs to, or None."""
    for g in GROUPS:
        if re.search(g["match"], family_name, re.I):
            return g["slug"]
    return None


collections, products, imgs = [], [], {}

for order, f in enumerate(fams):
    name = f["n"]
    cslug = slug(name)
    cps = f.get("cp") or {}
    variants_raw = f.get("v") or []

    # group variants by colourway
    by_colour = {}
    for v in variants_raw:
        by_colour.setdefault(v.get("c") or "", []).append(v)

    vout = []
    for colour, vs in by_colour.items():
        if not colour:
            continue
        cp = cps.get(colour) or {}
        key = cp.get("k")
        cname = title(colour)
        img = f"{cslug}-{slug(colour)}.webp" if key else None
        if key:
            imgs[img] = key
        prices = sorted({v["pr"] for v in vs if v.get("pr")})
        sizes = sorted({v["s"] for v in vs if v.get("s")},
                       key=lambda s: (len(s), s))
        # Pieces per unit.
        #
        # Where the shade NAME states a count ("... Set of 2") and the stored
        # pcs disagrees, trust the name: it is what the owner typed and what
        # the customer reads. Six of the twenty-seven named counts conflicted,
        # e.g. "Green Ball Kada Set of 2" stored as 1, and "Diamond Shaped Set
        # of 2" stored as 4.
        m = re.search(r"\b(?:set|pair|pack)\s+of\s+(\d+)\b", colour, re.I)
        pcs = int(m.group(1)) if m else next(
            (v.get("pcs") for v in vs if v.get("pcs")), None
        )
        instock = any(not v.get("o") for v in vs)
        vout.append({
            "colour": cname,
            "image": img,
            "hex": sw.get(colour.lower()) or sw.get(colour) or None,
            "price": prices[0] if prices else None,
            "pieces": pcs,
            "sizes": sizes,
            "inStock": instock,
            # focal point from the admin crop, as CSS object-position
            "focal": (f"{cp['fx']}% {cp['fy']}%" if cp.get("fx") is not None else None),
        })

    vout = [v for v in vout if v["image"]]
    if not vout:
        continue
    vout.sort(key=lambda v: v["colour"])

    allp = [v["price"] for v in vout if v["price"]]
    allsz = sorted({s for v in vout for s in v["sizes"]}, key=lambda s: (len(s), s))

    products.append({
        "id": cslug,
        "collection": cslug,
        "collectionName": name,
        "group": group_for(name),
        "name": name,
        "price": min(allp) if allp else None,
        "priceMax": max(allp) if allp else None,
        "pieces": vout[0]["pieces"],
        "unit": f.get("pu") or "set",
        "sizes": allsz,
        "blurb": BLURB.get(name, f"{name} — handpicked, in every shade we carry."),
        "story": STORY.get(name, ""),
        "variants": vout,
        "image": vout[0]["image"],
    })
    collections.append({
        "slug": cslug, "name": name, "group": group_for(name),
        "blurb": BLURB.get(name, ""), "story": STORY.get(name, ""),
        "cover": vout[0]["image"], "order": order,
    })

# ---------------------------------------------------------------- reels
# Families in the ANVEDA catalogue can carry a reel cover ("rc") and, for
# combos, a reel_url. We import whatever is there so the storefront's reel feed
# is populated from the same source as everything else.
#
# Priority, per the owner: an UPLOADED video always beats an Instagram link.
# The generator never touches public/video/reels — files dropped in there are
# matched by id below, and win.
REELDIR = os.path.join(ROOT, "public", "video", "reels")
REELS_OUT = os.path.join(ROOT, "src", "data", "reels.json")

os.makedirs(REELDIR, exist_ok=True)
existing_video = {
    os.path.splitext(f)[0]: f"/video/reels/{f}"
    for f in os.listdir(REELDIR)
    if f.lower().endswith((".mp4", ".webm", ".mov"))
}

reels_out = []
for f in fams:
    rc = f.get("rc")
    if not rc:
        continue
    fam_slug = slug(f["n"])
    cover_file = f"reel-{fam_slug}.jpg"
    imgs[cover_file] = rc                      # downloaded with the rest
    reels_out.append({
        "id": fam_slug,
        # An uploaded file wins; otherwise fall back to the Instagram link.
        "video": existing_video.get(fam_slug),
        "instagram": f.get("reel") or None,
        "cover": f"/img/products/{cover_file}",
        "title": f["n"],
        "caption": BLURB.get(f["n"], ""),
        "productId": fam_slug,
        "colour": None,
    })

json.dump({"reels": reels_out}, open(REELS_OUT, "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)
print(f"{len(reels_out)} reels "
      f"({sum(1 for r in reels_out if r['video'])} with uploaded video) -> {REELS_OUT}")

os.makedirs(IMGDIR, exist_ok=True)
new = 0
for fn, key in imgs.items():
    dest = os.path.join(IMGDIR, fn)
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        continue
    try:
        blob = fetch(PHOTO + key)
        open(dest, "wb").write(blob)
        new += 1
        print(f"  + {fn} ({len(blob)//1024}kb)")
    except Exception as e:
        print(f"  ! {fn}: {e}", file=sys.stderr)

groups_out = [
    {k: g[k] for k in ("slug", "name", "blurb")}
    for g in GROUPS
    if any(c["group"] == g["slug"] for c in collections)
]

json.dump({"groups": groups_out, "collections": collections, "products": products},
          open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
nv = sum(len(p["variants"]) for p in products)
print(f"\n{len(products)} products, {nv} colourways, {new} new photos -> {OUT}")
