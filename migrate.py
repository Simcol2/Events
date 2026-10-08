#!/usr/bin/env python3
"""Apply the /events -> /rentals route migration to TWO local Git clones.
Does not change database, payments or business rules.
Run: python3 migrate.py /path/to/asliceofg /path/to/events
"""
from pathlib import Path
import json, re, sys

if len(sys.argv)!=3:
    sys.exit("Usage: python3 migrate.py /path/to/asliceofg /path/to/events")
cake, rent = map(Path, sys.argv[1:])
assert (cake/"vercel.json").exists() and (cake/"events.html").exists()
assert (rent/"vite.config.js").exists() and (rent/"api/square.js").exists()

def write(path, content):
    path.write_text(content, encoding="utf-8")
    print("UPDATED", path)

# Original rental repo. Vite, server redirects, API URLs, generated HTML, SEO
# and static snapshots should all refer to /rentals instead of /events.
extensions={".js",".jsx",".ts",".tsx",".mjs",".json",".html",".xml",".css"}
count=0
for p in rent.rglob("*"):
    if not p.is_file() or p.suffix not in extensions: continue
    if any(d in p.parts for d in (".git","node_modules","dist",".vercel")): continue
    s=p.read_text(encoding="utf-8")
    new=s.replace("asliceofg.com/events", "asliceofg.com/rentals")
    new=new.replace('"/events', '"/rentals').replace("'/events", "'/rentals")
    new=new.replace('`/events', '`/rentals')
    # Text with path names embedded in templates or HTML attributes.
    new=new.replace("=/events/", "=/rentals/").replace("=/events\"", "=/rentals\"")
    if new!=s:
        write(p,new);count+=1

# Do not mutate rental business logic; verify important base paths changed.
assert 'base: "/rentals/"' in (rent/"vite.config.js").read_text()
assert '"/rentals"' in (rent/"api/_basePath.js").read_text()
rent_cfg=json.loads((rent/"vercel.json").read_text())
assert all(not r["source"].startswith("/events") for r in rent_cfg["rewrites"])

# Cake repo: /events is now the new cake page, /rentals reverse-proxies old app.
p=cake/"vercel.json"
cfg=json.loads(p.read_text())
cfg["rewrites"]=[
  {"source":"/events","destination":"/events.html"},
  {"source":"/rentals","destination":"https://events-mauve-three.vercel.app/rentals"},
  {"source":"/rentals/:path*","destination":"https://events-mauve-three.vercel.app/rentals/:path*"},
]
for group in cfg.get("headers",[]):
    group["source"]=group["source"].replace("events/", "rentals/")
    for header in group["headers"]:
        if header["key"].lower()=="cache-control" and group["source"]=="/rentals/:path*":
            header["value"]="no-store"
write(p,json.dumps(cfg,indent=2)+"\n")

# Keep cart in localStorage on asliceofg.com, take it into original rental app.
p=cake/"js/events-cart.js"
s=p.read_text()
assert "window.location.assign('/events/decor')" in s, "Checkout redirect changed unexpectedly"
write(p,s.replace("window.location.assign('/events/decor')",
                  "window.location.assign('/rentals/decor')"))

# Give cake-site homepage both desktop and mobile Events links.
p=cake/"index.html"
s=p.read_text()
anchor='<li><a href="catering.html">Catering</a></li>'
assert s.count(anchor)==1
s=s.replace(anchor,anchor+'\n      <li><a href="/events">Events</a></li>',1)
mobile='    <a href="catering.html">Catering</a>'
assert s.count(mobile)==1
s=s.replace(mobile,mobile+'\n    <a href="/events">Events</a>',1)
write(p,s)

# Make new page canonical and own exact URL.
p=cake/"events.html"
s=p.read_text().replace("https://asliceofg.com/events.html", "https://asliceofg.com/events")
# Linking events.html still works, but point to canonical /events.
s=s.replace('href="events.html"', 'href="/events"')
write(p,s)

assert json.loads((cake/"vercel.json").read_text())["rewrites"][0]["destination"]=="/events.html"
print(f"\nMigration updated {count} rental-app files plus cake-site routing and navigation.")
print("Commit original rental repository FIRST and verify /rentals/decor.")
print("Then commit cake-site repo main. Both sites must deploy before live booking.")
