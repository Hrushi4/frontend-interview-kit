# 15 — DSA for Frontend Engineers (JavaScript)

Frontend DSA rounds favour arrays, strings, hash maps, two pointers, sliding window, stacks, trees (the DOM is a tree!), BFS/DFS and light DP. Learn the **pattern** and say the complexity out loud.

Levels: **📋 Pattern map → 🟢 Easy → 🟡 Medium → 🔴 Hard → 🌐 Frontend-flavoured → 📝 Practice list**

How to answer: clarify input/edge cases → brute force + complexity → optimize → code → dry-run with an example → state time/space.

---

## 📋 Pattern map

| Pattern | Signal in the question | Examples |
|---|---|---|
| Hash map / set | "seen before", counts, pairs | Two Sum, Anagrams, First Unique |
| Two pointers | sorted array, palindrome, pair from both ends | Valid Palindrome, 3Sum, Container With Most Water |
| Sliding window | longest/shortest contiguous subarray/substring | Longest Substring w/o Repeat, Min Window |
| Prefix sum | range sums, subarray sum = k | Subarray Sum Equals K |
| Stack | matching brackets, next greater, undo | Valid Parentheses, Daily Temperatures |
| Monotonic queue | sliding window max | Sliding Window Maximum |
| Binary search | sorted data or monotonic answer | Search Rotated, Koko Bananas |
| BFS | shortest path in unweighted graph, levels | Level Order, Rotting Oranges |
| DFS / backtracking | explore all paths/combinations | Islands, Permutations, Subsets |
| Intervals | overlap/merge | Merge Intervals, Meeting Rooms |
| Heap | top-K, k-way merge, streaming median | Top K Frequent, Kth Largest |
| Topological sort | dependencies/order | Course Schedule, build order |
| DP | optimal substructure, overlapping subproblems | Climbing Stairs, Coin Change, LIS |
| Trie | prefix search | Autocomplete |
| Union-Find | connectivity | Number of Provinces |

**Big-O cheat:** Map/Set get/set O(1) avg · `array.shift()` O(n) (use index pointer for queues) · `sort` O(n log n) · `includes` on array O(n) · string concatenation in loops → use array join for big builds · recursion depth limit ~10k frames.

---

## 🟢 Easy

**1. Two Sum** — O(n) time, O(n) space
```js
function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}
```

**2. Valid Anagram** — O(n)
```js
function isAnagram(a, b) {
  if (a.length !== b.length) return false;
  const count = new Map();
  for (const c of a) count.set(c, (count.get(c) ?? 0) + 1);
  for (const c of b) { if (!count.get(c)) return false; count.set(c, count.get(c) - 1); }
  return true;
}
```

**3. Valid Palindrome (ignore non-alphanumerics)** — two pointers
```js
function isPalindrome(s) {
  const ok = c => /[a-z0-9]/i.test(c);
  let l = 0, r = s.length - 1;
  while (l < r) {
    if (!ok(s[l])) { l++; continue; }
    if (!ok(s[r])) { r--; continue; }
    if (s[l].toLowerCase() !== s[r].toLowerCase()) return false;
    l++; r--;
  }
  return true;
}
```

**4. Valid Parentheses** — stack
```js
function isValid(s) {
  const pair = { ')': '(', ']': '[', '}': '{' }, st = [];
  for (const c of s) {
    if (!(c in pair)) st.push(c);
    else if (st.pop() !== pair[c]) return false;
  }
  return st.length === 0;
}
```

**5. Best Time to Buy and Sell Stock** — one pass
```js
function maxProfit(prices) {
  let min = Infinity, best = 0;
  for (const p of prices) { min = Math.min(min, p); best = Math.max(best, p - min); }
  return best;
}
```

**6. Maximum Subarray (Kadane)**
```js
function maxSubArray(nums) {
  let cur = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) { cur = Math.max(nums[i], cur + nums[i]); best = Math.max(best, cur); }
  return best;
}
```

**7. Contains Duplicate** — `new Set(nums).size !== nums.length`.

**8. Reverse a Linked List**
```js
function reverseList(head) {
  let prev = null;
  while (head) { const next = head.next; head.next = prev; prev = head; head = next; }
  return prev;
}
```

**9. Merge Two Sorted Lists**
```js
function mergeTwoLists(a, b) {
  const dummy = { next: null }; let t = dummy;
  while (a && b) { if (a.val <= b.val) { t.next = a; a = a.next; } else { t.next = b; b = b.next; } t = t.next; }
  t.next = a ?? b;
  return dummy.next;
}
```

**10. Linked List Cycle (Floyd)**
```js
function hasCycle(head) {
  let slow = head, fast = head;
  while (fast?.next) { slow = slow.next; fast = fast.next.next; if (slow === fast) return true; }
  return false;
}
```

**11. Binary Search**
```js
function search(a, t) {
  let l = 0, r = a.length - 1;
  while (l <= r) { const m = (l + r) >> 1; if (a[m] === t) return m; a[m] < t ? (l = m + 1) : (r = m - 1); }
  return -1;
}
```

**12. Maximum Depth of Binary Tree**
`const maxDepth = n => n ? 1 + Math.max(maxDepth(n.left), maxDepth(n.right)) : 0;`

**13. Invert Binary Tree**
```js
function invert(n) { if (!n) return n; [n.left, n.right] = [invert(n.right), invert(n.left)]; return n; }
```

**14. Climbing Stairs** — Fibonacci DP O(n) time O(1) space
```js
function climbStairs(n) { let a = 1, b = 1; for (let i = 2; i <= n; i++) [a, b] = [b, a + b]; return b; }
```

**15. First Unique Character**
```js
function firstUniqChar(s) {
  const c = new Map(); for (const ch of s) c.set(ch, (c.get(ch) ?? 0) + 1);
  for (let i = 0; i < s.length; i++) if (c.get(s[i]) === 1) return i;
  return -1;
}
```

**16. Move Zeroes (in place)**
```js
function moveZeroes(a) { let w = 0; for (let r = 0; r < a.length; r++) if (a[r] !== 0) [a[w++], a[r]] = [a[r], a[w]]; return a; }
```

---

## 🟡 Medium

**17. Longest Substring Without Repeating Characters** — sliding window O(n)
```js
function lengthOfLongestSubstring(s) {
  const last = new Map(); let l = 0, best = 0;
  for (let r = 0; r < s.length; r++) {
    if (last.has(s[r]) && last.get(s[r]) >= l) l = last.get(s[r]) + 1;
    last.set(s[r], r); best = Math.max(best, r - l + 1);
  }
  return best;
}
```

**18. Group Anagrams** — O(n · k log k)
```js
function groupAnagrams(strs) {
  const m = new Map();
  for (const s of strs) { const k = [...s].sort().join(''); if (!m.has(k)) m.set(k, []); m.get(k).push(s); }
  return [...m.values()];
}
```

**19. Top K Frequent Elements** — bucket sort O(n)
```js
function topKFrequent(nums, k) {
  const freq = new Map(); for (const n of nums) freq.set(n, (freq.get(n) ?? 0) + 1);
  const buckets = Array.from({ length: nums.length + 1 }, () => []);
  for (const [n, c] of freq) buckets[c].push(n);
  const out = [];
  for (let c = buckets.length - 1; c >= 0 && out.length < k; c--) out.push(...buckets[c]);
  return out.slice(0, k);
}
```

**20. Product of Array Except Self** — prefix/suffix O(n), no division
```js
function productExceptSelf(nums) {
  const out = Array(nums.length).fill(1);
  let pre = 1; for (let i = 0; i < nums.length; i++) { out[i] = pre; pre *= nums[i]; }
  let suf = 1; for (let i = nums.length - 1; i >= 0; i--) { out[i] *= suf; suf *= nums[i]; }
  return out;
}
```

**21. 3Sum** — sort + two pointers O(n²)
```js
function threeSum(nums) {
  nums.sort((a, b) => a - b); const res = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i && nums[i] === nums[i - 1]) continue;
    let l = i + 1, r = nums.length - 1;
    while (l < r) {
      const s = nums[i] + nums[l] + nums[r];
      if (s === 0) { res.push([nums[i], nums[l], nums[r]]); while (nums[l] === nums[l + 1]) l++; while (nums[r] === nums[r - 1]) r--; l++; r--; }
      else s < 0 ? l++ : r--;
    }
  }
  return res;
}
```

**22. Container With Most Water** — two pointers
```js
function maxArea(h) {
  let l = 0, r = h.length - 1, best = 0;
  while (l < r) { best = Math.max(best, Math.min(h[l], h[r]) * (r - l)); h[l] < h[r] ? l++ : r--; }
  return best;
}
```

**23. Subarray Sum Equals K** — prefix sums + map O(n)
```js
function subarraySum(nums, k) {
  const seen = new Map([[0, 1]]); let sum = 0, count = 0;
  for (const n of nums) { sum += n; count += seen.get(sum - k) ?? 0; seen.set(sum, (seen.get(sum) ?? 0) + 1); }
  return count;
}
```

**24. Merge Intervals**
```js
function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]); const out = [];
  for (const [s, e] of intervals) {
    const last = out.at(-1);
    if (last && s <= last[1]) last[1] = Math.max(last[1], e); else out.push([s, e]);
  }
  return out;
}
```

**25. Meeting Rooms II (min rooms)** — sweep line
```js
function minMeetingRooms(iv) {
  const starts = iv.map(i => i[0]).sort((a, b) => a - b), ends = iv.map(i => i[1]).sort((a, b) => a - b);
  let rooms = 0, e = 0;
  for (const s of starts) { if (s < ends[e]) rooms++; else e++; }
  return rooms;
}
```

**26. Daily Temperatures** — monotonic stack
```js
function dailyTemperatures(t) {
  const res = Array(t.length).fill(0), st = [];
  for (let i = 0; i < t.length; i++) {
    while (st.length && t[i] > t[st.at(-1)]) { const j = st.pop(); res[j] = i - j; }
    st.push(i);
  }
  return res;
}
```

**27. Min Stack** — O(1) getMin
```js
class MinStack {
  st = []; mins = [];
  push(x) { this.st.push(x); this.mins.push(Math.min(x, this.mins.at(-1) ?? Infinity)); }
  pop() { this.st.pop(); this.mins.pop(); }
  top() { return this.st.at(-1); }
  getMin() { return this.mins.at(-1); }
}
```

**28. Search in Rotated Sorted Array** — O(log n)
```js
function searchRotated(a, t) {
  let l = 0, r = a.length - 1;
  while (l <= r) {
    const m = (l + r) >> 1; if (a[m] === t) return m;
    if (a[l] <= a[m]) { if (a[l] <= t && t < a[m]) r = m - 1; else l = m + 1; }
    else { if (a[m] < t && t <= a[r]) l = m + 1; else r = m - 1; }
  }
  return -1;
}
```

**29. Koko Eating Bananas** — binary search on answer
```js
function minEatingSpeed(piles, h) {
  let l = 1, r = Math.max(...piles);
  while (l < r) {
    const k = (l + r) >> 1;
    const hours = piles.reduce((s, p) => s + Math.ceil(p / k), 0);
    hours <= h ? (r = k) : (l = k + 1);
  }
  return l;
}
```

**30. Binary Tree Level Order** — BFS (index pointer instead of shift)
```js
function levelOrder(root) {
  if (!root) return []; const res = []; let q = [root];
  while (q.length) {
    res.push(q.map(n => n.val));
    q = q.flatMap(n => [n.left, n.right].filter(Boolean));
  }
  return res;
}
```

**31. Validate BST**
```js
function isValidBST(n, lo = -Infinity, hi = Infinity) {
  if (!n) return true;
  if (n.val <= lo || n.val >= hi) return false;
  return isValidBST(n.left, lo, n.val) && isValidBST(n.right, n.val, hi);
}
```

**32. Lowest Common Ancestor (binary tree)**
```js
function lca(root, p, q) {
  if (!root || root === p || root === q) return root;
  const L = lca(root.left, p, q), R = lca(root.right, p, q);
  return L && R ? root : L ?? R;
}
```

**33. Number of Islands** — DFS
```js
function numIslands(g) {
  let n = 0;
  const dfs = (r, c) => {
    if (r < 0 || c < 0 || r >= g.length || c >= g[0].length || g[r][c] !== '1') return;
    g[r][c] = '0'; dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);
  };
  for (let r = 0; r < g.length; r++) for (let c = 0; c < g[0].length; c++) if (g[r][c] === '1') { n++; dfs(r, c); }
  return n;
}
```

**34. Rotting Oranges** — multi-source BFS
```js
function orangesRotting(g) {
  let q = [], fresh = 0, mins = 0;
  g.forEach((row, r) => row.forEach((v, c) => { if (v === 2) q.push([r, c]); if (v === 1) fresh++; }));
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  while (q.length && fresh) {
    const next = [];
    for (const [r, c] of q) for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (g[nr]?.[nc] === 1) { g[nr][nc] = 2; fresh--; next.push([nr, nc]); }
    }
    q = next; mins++;
  }
  return fresh ? -1 : mins;
}
```

**35. Course Schedule** — topological sort (Kahn)
```js
function canFinish(n, prereqs) {
  const indeg = Array(n).fill(0), adj = Array.from({ length: n }, () => []);
  for (const [a, b] of prereqs) { adj[b].push(a); indeg[a]++; }
  const q = []; indeg.forEach((d, i) => d === 0 && q.push(i));
  let seen = 0;
  for (let i = 0; i < q.length; i++) { seen++; for (const nx of adj[q[i]]) if (--indeg[nx] === 0) q.push(nx); }
  return seen === n;
}
```

**36. Permutations** — backtracking
```js
function permute(nums) {
  const res = [], path = [], used = Array(nums.length).fill(false);
  (function bt() {
    if (path.length === nums.length) return res.push([...path]);
    for (let i = 0; i < nums.length; i++) { if (used[i]) continue; used[i] = true; path.push(nums[i]); bt(); path.pop(); used[i] = false; }
  })();
  return res;
}
```

**37. Subsets**
```js
const subsets = nums => nums.reduce((acc, n) => acc.concat(acc.map(s => [...s, n])), [[]]);
```

**38. Coin Change** — DP O(amount × coins)
```js
function coinChange(coins, amount) {
  const dp = Array(amount + 1).fill(Infinity); dp[0] = 0;
  for (let a = 1; a <= amount; a++) for (const c of coins) if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
  return dp[amount] === Infinity ? -1 : dp[amount];
}
```

**39. House Robber**
```js
function rob(nums) { let prev = 0, cur = 0; for (const n of nums) [prev, cur] = [cur, Math.max(cur, prev + n)]; return cur; }
```

**40. Longest Increasing Subsequence** — O(n log n) patience sorting
```js
function lengthOfLIS(nums) {
  const tails = [];
  for (const x of nums) {
    let l = 0, r = tails.length;
    while (l < r) { const m = (l + r) >> 1; tails[m] < x ? (l = m + 1) : (r = m); }
    tails[l] = x;
  }
  return tails.length;
}
```

**41. Word Break**
```js
function wordBreak(s, dict) {
  const words = new Set(dict), dp = Array(s.length + 1).fill(false); dp[0] = true;
  for (let i = 1; i <= s.length; i++) for (let j = 0; j < i; j++) if (dp[j] && words.has(s.slice(j, i))) { dp[i] = true; break; }
  return dp[s.length];
}
```

**42. Kth Largest Element** — quickselect avg O(n) (or min-heap of size k)
```js
function findKthLargest(nums, k) {
  const target = nums.length - k;
  let l = 0, r = nums.length - 1;
  while (true) {
    const pivot = nums[r]; let p = l;
    for (let i = l; i < r; i++) if (nums[i] <= pivot) [nums[i], nums[p]] = [nums[p], nums[i]], p++;
    [nums[p], nums[r]] = [nums[r], nums[p]];
    if (p === target) return nums[p];
    p < target ? (l = p + 1) : (r = p - 1);
  }
}
```

**43. LRU Cache** — Map preserves insertion order
```js
class LRUCache {
  constructor(cap) { this.cap = cap; this.m = new Map(); }
  get(k) { if (!this.m.has(k)) return -1; const v = this.m.get(k); this.m.delete(k); this.m.set(k, v); return v; }
  put(k, v) { this.m.delete(k); this.m.set(k, v); if (this.m.size > this.cap) this.m.delete(this.m.keys().next().value); }
}
```

**44. Implement a Trie (autocomplete)**
```js
class Trie {
  root = { children: new Map(), end: false };
  insert(w) { let n = this.root; for (const c of w) { if (!n.children.has(c)) n.children.set(c, { children: new Map(), end: false }); n = n.children.get(c); } n.end = true; }
  suggest(prefix, limit = 5) {
    let n = this.root; for (const c of prefix) { n = n.children.get(c); if (!n) return []; }
    const out = [];
    (function dfs(node, acc) { if (out.length >= limit) return; if (node.end) out.push(acc); for (const [c, ch] of node.children) dfs(ch, acc + c); })(n, prefix);
    return out;
  }
}
```

---

## 🔴 Hard (senior/product companies)

**45. Minimum Window Substring** — sliding window O(n)
```js
function minWindow(s, t) {
  const need = new Map(); for (const c of t) need.set(c, (need.get(c) ?? 0) + 1);
  let missing = t.length, l = 0, start = 0, len = Infinity;
  for (let r = 0; r < s.length; r++) {
    if ((need.get(s[r]) ?? 0) > 0) missing--;
    need.set(s[r], (need.get(s[r]) ?? 0) - 1);
    while (missing === 0) {
      if (r - l + 1 < len) { len = r - l + 1; start = l; }
      need.set(s[l], need.get(s[l]) + 1);
      if (need.get(s[l]) > 0) missing++;
      l++;
    }
  }
  return len === Infinity ? '' : s.slice(start, start + len);
}
```

**46. Sliding Window Maximum** — monotonic deque O(n)
```js
function maxSlidingWindow(nums, k) {
  const dq = [], res = []; let head = 0;
  for (let i = 0; i < nums.length; i++) {
    while (dq.length > head && nums[dq.at(-1)] <= nums[i]) dq.pop();
    dq.push(i);
    if (dq[head] <= i - k) head++;
    if (i >= k - 1) res.push(nums[dq[head]]);
  }
  return res;
}
```

**47. Merge K Sorted Lists** — divide and conquer O(N log k) (reuse mergeTwoLists)
```js
function mergeKLists(lists) {
  if (!lists.length) return null;
  while (lists.length > 1) {
    const next = [];
    for (let i = 0; i < lists.length; i += 2) next.push(mergeTwoLists(lists[i], lists[i + 1] ?? null));
    lists = next;
  }
  return lists[0];
}
```

**48. Trapping Rain Water** — two pointers O(n)
```js
function trap(h) {
  let l = 0, r = h.length - 1, lmax = 0, rmax = 0, water = 0;
  while (l < r) {
    if (h[l] < h[r]) { lmax = Math.max(lmax, h[l]); water += lmax - h[l]; l++; }
    else { rmax = Math.max(rmax, h[r]); water += rmax - h[r]; r--; }
  }
  return water;
}
```

**49. Serialize / Deserialize Binary Tree**
```js
const serialize = root => { const out = []; (function f(n) { if (!n) return out.push('#'); out.push(n.val); f(n.left); f(n.right); })(root); return out.join(','); };
const deserialize = data => { const v = data.split(','); let i = 0; return (function f() { const x = v[i++]; if (x === '#') return null; return { val: +x, left: f(), right: f() }; })(); };
```

**50. Edit Distance** — DP O(m·n) (used in diffing, fuzzy search)
```js
function minDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
  return dp[a.length][b.length];
}
```

**51. Median from Data Stream** — two heaps (implement a small heap class in interviews or explain).

---

## 🌐 Frontend-flavoured DSA (very common in UI interviews)

**52. Flatten nested object to dot paths**
```js
function flattenObject(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flattenObject(v, key, out); else out[key] = v;
  }
  return out;
}
```

**53. Unflatten dot paths back to nested object**
```js
function unflatten(flat) {
  const out = {};
  for (const [path, v] of Object.entries(flat)) {
    const keys = path.split('.'); let cur = out;
    keys.forEach((k, i) => { cur = cur[k] ??= i === keys.length - 1 ? v : {}; });
  }
  return out;
}
```

**54. Flat list with parentId → tree (comments, org chart, file explorer)** — O(n)
```js
function toTree(items) {
  const map = new Map(items.map(i => [i.id, { ...i, children: [] }])), roots = [];
  for (const node of map.values()) {
    const parent = node.parentId != null ? map.get(node.parentId) : null;
    (parent ? parent.children : roots).push(node);
  }
  return roots;
}
```

**55. Find all DOM nodes matching a predicate (DOM traversal)**
```js
function findAll(root, pred) {
  const out = [], stack = [root];
  while (stack.length) { const n = stack.pop(); if (pred(n)) out.push(n); for (let i = n.children.length - 1; i >= 0; i--) stack.push(n.children[i]); }
  return out;
}
```

**56. Find the corresponding node in an identical DOM tree**
```js
function findMirror(rootA, rootB, nodeA) {
  const path = [];
  for (let n = nodeA; n !== rootA; n = n.parentElement) path.push([...n.parentElement.children].indexOf(n));
  return path.reverse().reduce((n, i) => n.children[i], rootB);
}
```

**57. Lowest common ancestor of two DOM nodes**
```js
function domLCA(a, b) { const seen = new Set(); for (let n = a; n; n = n.parentElement) seen.add(n); for (let n = b; n; n = n.parentElement) if (seen.has(n)) return n; return null; }
```

**58. Highlight search matches in text (return segments, no innerHTML)**
```js
function highlight(text, query) {
  if (!query) return [{ text, match: false }];
  const esc = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.split(new RegExp(`(${esc})`, 'gi')).filter(Boolean).map(part => ({ text: part, match: part.toLowerCase() === query.toLowerCase() }));
}
```

**59. Pagination window with ellipsis `1 … 4 5 [6] 7 8 … 20`**
```js
function pageWindow(current, total, radius = 2) {
  const pages = new Set([1, total]);
  for (let p = current - radius; p <= current + radius; p++) if (p > 1 && p < total) pages.add(p);
  const sorted = [...pages].sort((a, b) => a - b), out = [];
  sorted.forEach((p, i) => { if (i && p - sorted[i - 1] > 1) out.push('…'); out.push(p); });
  return out;
}
```

**60. Concurrency-limited promise pool**
```js
async function pool(tasks, limit) {
  const results = []; let next = 0;
  const worker = async () => { while (next < tasks.length) { const i = next++; results[i] = await tasks[i](); } };
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}
```

**61. Group calls by agent and compute averages**
```js
function averageScoreByAgent(calls) {
  const acc = new Map();
  for (const { agent, score } of calls) { if (score == null) continue; const a = acc.get(agent) ?? { sum: 0, n: 0 }; a.sum += score; a.n++; acc.set(agent, a); }
  return [...acc].map(([agent, { sum, n }]) => ({ agent, avg: +(sum / n).toFixed(1) })).sort((a, b) => b.avg - a.avg);
}
```

**62. Find the active transcript line for a playback time** — binary search
```js
function activeLine(lines, t) {
  let lo = 0, hi = lines.length - 1, ans = -1;
  while (lo <= hi) { const m = (lo + hi) >> 1; if (lines[m].start <= t) { ans = m; lo = m + 1; } else hi = m - 1; }
  return ans;
}
```

**63. Merge overlapping time ranges of flagged compliance segments** — same as Merge Intervals (Q24).

**64. Detect circular dependencies in module imports** — DFS with colours (white/grey/black) or Kahn's algorithm (Q35).

**65. Implement `JSON.stringify` subset (recursion practice)**
```js
function stringify(v) {
  if (v === null || typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (typeof v === 'string') return `"${v.replace(/["\\]/g, '\\$&')}"`;
  if (Array.isArray(v)) return `[${v.map(x => (x === undefined || typeof x === 'function' ? 'null' : stringify(x))).join(',')}]`;
  if (typeof v === 'object') return `{${Object.entries(v).filter(([, x]) => x !== undefined && typeof x !== 'function').map(([k, x]) => `"${k}":${stringify(x)}`).join(',')}}`;
}
```

---

## 📝 Practice list (mark when done)

**Arrays & strings:** Two Sum · Best Time Buy/Sell · Contains Duplicate · Product Except Self · Maximum Subarray · 3Sum · Container With Most Water · Longest Substring w/o Repeat · Longest Repeating Character Replacement · Minimum Window Substring · Group Anagrams · Valid Palindrome · Encode/Decode Strings
**Stack/queue:** Valid Parentheses · Min Stack · Daily Temperatures · Evaluate RPN · Sliding Window Maximum
**Binary search:** Search Rotated · Find Min in Rotated · Koko Bananas · Time-Based Key-Value Store
**Linked list:** Reverse · Merge Two · Cycle · Remove Nth From End · Reorder List · LRU Cache · Merge K
**Trees:** Invert · Max Depth · Same Tree · Subtree · Level Order · Right Side View · Validate BST · Kth Smallest BST · LCA · Serialize/Deserialize
**Graphs:** Number of Islands · Clone Graph · Rotting Oranges · Pacific Atlantic · Course Schedule I/II · Word Ladder
**Backtracking:** Subsets · Permutations · Combination Sum · Word Search
**DP:** Climbing Stairs · House Robber I/II · Coin Change · LIS · Word Break · Longest Common Subsequence · Edit Distance · Unique Paths
**Heaps:** Kth Largest · Top K Frequent · Median Data Stream · Task Scheduler
**Intervals:** Merge · Insert · Non-overlapping · Meeting Rooms II
**Trie:** Implement Trie · Word Search II (stretch)
