"""Replace everything from the first '## Part B' heading of a kit file with new content."""
import sys, re
target, new = sys.argv[1], sys.argv[2]
s = open(target, encoding='utf-8').read()
m = re.search(r'(?m)^## Part B', s)
head = s[:m.start()] if m else s.rstrip() + '\n\n---\n\n'
open(target, 'w', encoding='utf-8').write(head + open(new, encoding='utf-8').read())
print('updated', target)
