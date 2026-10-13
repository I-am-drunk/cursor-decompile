import concurrent.futures, hashlib, json, re, urllib.request, urllib.parse
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
seen=set(); records=[]
def fetch(u):
    path=urllib.parse.urlsplit(u).path
    dest=ROOT/'site'/('index.html' if path=='/' else path.lstrip('/'))
    try:
        req=urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'})
        with urllib.request.urlopen(req,timeout=45) as r:
            data=r.read(); status=r.status; mime=r.headers.get('Content-Type','')
        dest.parent.mkdir(parents=True,exist_ok=True); dest.write_bytes(data)
        row=dict(url=u,path=str(dest.relative_to(ROOT)),status=status,bytes=len(data),sha256=hashlib.sha256(data).hexdigest(),contentType=mime)
        refs=[]
        if path=='/' or path.endswith(('.js','.css','.json','.webmanifest')):
            s=data.decode('utf-8',errors='replace')
            candidates=re.findall(r'''["'`]([^"'`\s<>]+)["'`]''',s)+re.findall(r'url\(([^)]+)\)',s)
            for raw in candidates:
                raw=raw.strip('"\'')
                if raw.startswith('data:') or '${' in raw: continue
                if re.search(r'\.(?:js|css|woff2?|ttf|otf|png|jpe?g|webp|avif|gif|svg|ico|webmanifest|mp4|webm|ogg|mp3)(?:[?#].*)?$',raw):
                    if raw.startswith('assets/'): raw='/'+raw
                    ref=urllib.parse.urljoin(u,raw).split('#')[0]
                    if urllib.parse.urlsplit(ref).netloc=='atsu.moe': refs.append(ref)
        return row,refs
    except Exception as e: return dict(url=u,error=str(e)),[]
queue=['https://atsu.moe/']
while queue:
    batch=[u for u in sorted(set(queue)) if u not in seen]; seen.update(batch); queue=[]
    if not batch: break
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
        for row,refs in pool.map(fetch,batch): records.append(row); queue.extend(refs)
    (ROOT/'manifest.json').write_text(json.dumps(records,indent=2)+'\n')
    print(len(records),'responses;',len(queue),'references',flush=True)
