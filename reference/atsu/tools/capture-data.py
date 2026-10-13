import concurrent.futures,hashlib,json,urllib.request,urllib.parse
from pathlib import Path
root=Path(__file__).resolve().parents[1];rows=[]
endpoints=['hotUpdates','recentlyUpdated','popular','rising','hotArrivals','mostBookmarked','mostTalkedAbout','recentlyAdded','topRated','hiddenGems','bingeWorthy','mostPolarizing']
def get(u,p):
 try:
  with urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":"Mozilla/5.0"}),timeout=30) as r: b=r.read();mime=r.headers.get('Content-Type','')
  p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(b)
  rows.append(dict(url=u,path=str(p.relative_to(root)),bytes=len(b),sha256=hashlib.sha256(b).hexdigest(),contentType=mime))
  return b
 except Exception as e:rows.append(dict(url=u,error=str(e)));return b''
refs=set()
for e in endpoints:
 u='https://atsu.moe/api/home2/'+e+'?offset=0&limit=24';b=get(u,root/'data'/(e+'.json'))
 try:
  data=json.loads(b)
  for item in data.get('items',[]):
   for k in ['image','smallImage','mediumImage','largeImage']:
    if item.get(k): refs.add('https://cdn.atsu.moe/static/'+item[k])
 except Exception:pass
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
 list(pool.map(lambda u:get(u,root/'cdn'/urllib.parse.urlsplit(u).path.lstrip('/')),sorted(refs)))
(root/'data-manifest.json').write_text(json.dumps(rows,indent=2)+'\n')
print(len(rows),'responses',sum('error' in x for x in rows),'errors')
