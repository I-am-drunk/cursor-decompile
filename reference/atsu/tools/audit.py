import hashlib,json,re
from pathlib import Path
R=Path(__file__).resolve().parents[1]
out=dict(hashes=0,anchors=0,failures=[],capture_errors=[],mime_mismatches=[])
for name in ['manifest.json','data-manifest.json']:
 for r in json.loads((R/name).read_text()):
  if 'error' in r:out['capture_errors'].append(r);continue
  p=R/r['path'];out['hashes']+=1
  if not p.exists() or hashlib.sha256(p.read_bytes()).hexdigest()!=r['sha256']:out['failures'].append(r['path'])
  if p.suffix=='.png' and 'text/html' in r.get('contentType',''):out['mime_mismatches'].append(r['url'])
for name in ['anchors.json','supplementary-anchors.json']:
 for r in json.loads((R/'analysis'/name).read_text()):
  if 'needle' not in r or 'offset' not in r:continue
  out['anchors']+=1
  if not (R/r['file']).read_bytes()[r['offset']:].startswith(r['needle'].encode()):out['failures'].append(r)
(R/'analysis/audit.json').write_text(json.dumps(out,indent=2)+'\n')
print(json.dumps(out,indent=2))
raise SystemExit(bool(out['failures']))
