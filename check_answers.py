"""Report questions that are missing any of the four required answer parts."""
import re, glob, sys
LABELS = ['**Short answer:**', '**Explanation:**', '**Example:**', '**Say it like this:**']
bad_total = 0
for f in sorted(glob.glob('frontend-interview-kit/*.md') + glob.glob('backend-interview-kit/*.md')):
    s = open(f, encoding='utf-8').read()
    parts = re.split(r'(?m)^(?=\*\*Q\d+\.|### Q\d+\.|### Design \d+)', s)
    qs = [p for p in parts if re.match(r'(\*\*|### )Q\d+\.|### Design \d+', p)]
    if not qs: continue
    bad = [re.match(r'(?:\*\*|### )(Q\d+|Design \d+)', q).group(1) for q in qs if not all(l in q for l in LABELS)]
    bad_total += len(bad)
    print(f'{f}: {len(qs)} questions, {len(qs)-len(bad)} complete', ('missing: ' + ', '.join(bad[:15]) + (' …' if len(bad) > 15 else '')) if bad else '')
print('TOTAL incomplete:', bad_total)
sys.exit(1 if bad_total else 0)
