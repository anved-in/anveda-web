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
        pcs = next((v.get("pcs") for v in vs if v.get("pcs")), None)
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
        "slug": cslug, "name": name,
        "blurb": BLURB.get(name, ""), "story": STORY.get(name, ""),
        "cover": vout[0]["image"], "order": order,
    })

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

json.dump({"collections": collections, "products": products},
          open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
nv = sum(len(p["variants"]) for p in products)
print(f"\n{len(products)} products, {nv} colourways, {new} new photos -> {OUT}")
