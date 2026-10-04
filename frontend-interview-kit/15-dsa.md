# 15 — DSA for Frontend Engineers (JavaScript)

Frontend DSA rounds favour arrays, strings, hash maps, two pointers, sliding windows, stacks, trees (the DOM is a tree!), BFS and DFS, and light dynamic programming. Learn the **pattern**, and say the complexity out loud.

**How this file is organised**

- **Part A — Understand the topic:** Big-O, the core data structures, and the main problem-solving patterns, explained simply.
- **Part B — Problems with explanations:** Easy → Medium → Hard → Frontend-flavoured → Practice list.

Each problem has a **Short answer** (the approach and complexity), an **Explanation** (the idea and why it works), an **Example** (the code with a sample input) and **Say it like this** (how to talk through it while coding).

---

## Part A — Understand the Topic

### How to answer any DSA question (the interview script)

1. **Clarify:** input size, edge cases (empty input, duplicates, negatives), and the expected output format.
2. **Brute force first:** state it and its complexity ("Checking every pair is O(n²)").
3. **Optimise:** spot the pattern ("We need fast lookups of what we've seen, so a hash map").
4. **Code** cleanly with good names.
5. **Dry run** with a small example and trace the variables.
6. **State the time and space complexity.**

**Say it like this (opening):** "Let me restate the problem and confirm the edge cases. The brute force would be to check every pair, which is O(n²). I think we can do better with a hash map, trading O(n) space for O(n) time. Let me code that."

### Big-O in plain English

Big-O describes how the running time (or memory) **grows** as the input grows:

| Big-O | Name | Example | 1,000 items → about |
|---|---|---|---|
| O(1) | constant | Map lookup, array index | 1 step |
| O(log n) | logarithmic | binary search | 10 steps |
| O(n) | linear | one loop | 1,000 steps |
| O(n log n) | linearithmic | sorting | 10,000 steps |
| O(n²) | quadratic | nested loops over the same array | 1,000,000 steps |
| O(2ⁿ) | exponential | all subsets | astronomically many |

**JavaScript costs to remember:**

- `Map` and `Set` get/set/has are O(1) on average.
- `array.includes` and `indexOf` are O(n).
- `array.shift()` is O(n), so use an index pointer for queues.
- `sort` is O(n log n).
- Recursion depth is limited to roughly 10,000 frames.
- Building a large string by concatenating in a loop is slow, so push to an array and `join`.

### Core data structures

| Structure | In JavaScript | Good for |
|---|---|---|
| Array | `[]` | ordered data, index access O(1) |
| Hash map | `Map` / object | "have I seen this?", counting, lookup by key |
| Set | `Set` | uniqueness, fast membership |
| Stack (LIFO) | array `push`/`pop` | matching brackets, undo, DFS |
| Queue (FIFO) | array + head index | BFS, task scheduling |
| Linked list | `{ val, next }` objects | O(1) insert and delete at known nodes |
| Tree | `{ val, left, right }` / DOM | hierarchies, searching |
| Graph | adjacency list `Map<node, node[]>` | networks, dependencies |
| Heap | custom class | top-K, priority queues |
| Trie | nested maps | prefix search, autocomplete |

### The pattern map: recognise the signal, apply the pattern

| Pattern | Signal in the question | Examples |
|---|---|---|
| Hash map / set | "seen before", counts, pairs | Two Sum, Anagrams, First Unique |
| Two pointers | sorted array, palindrome, pairs from both ends | Valid Palindrome, 3Sum, Container With Most Water |
| Sliding window | longest/shortest *contiguous* subarray or substring | Longest Substring Without Repeating, Min Window |
| Prefix sum | range sums, subarray sum equals k | Subarray Sum Equals K |
| Stack | matching brackets, "next greater", undo | Valid Parentheses, Daily Temperatures |
| Monotonic queue | sliding window max or min | Sliding Window Maximum |
| Binary search | sorted data, or a monotonic answer | Search Rotated, Koko Bananas |
| BFS | shortest path in an unweighted graph, levels | Level Order, Rotting Oranges |
| DFS / backtracking | explore all paths or combinations | Islands, Permutations, Subsets |
| Intervals | overlap or merge | Merge Intervals, Meeting Rooms |
| Heap | top-K, k-way merge, streaming median | Top K Frequent, Kth Largest |
| Topological sort | dependencies and ordering | Course Schedule, build order |
| Dynamic programming | optimal substructure, overlapping subproblems | Climbing Stairs, Coin Change, LIS |
| Trie | prefix search | Autocomplete |
| Union-Find | connectivity | Number of Provinces |

### Quick explanations of the key patterns

- **Two pointers:** two indexes moving towards each other (or in the same direction) to avoid nested loops. It works because the data is sorted or symmetric.
- **Sliding window:** keep a "window" `[left, right]` over the array. Expand `right`, and shrink `left` when the window becomes invalid. Each element enters and leaves once, so it's O(n).
- **Prefix sum:** `prefix[i]` is the sum of everything before `i`, so the sum of a range is `prefix[r] − prefix[l]`, computed in O(1).
- **BFS:** explore level by level with a queue, which finds shortest paths in unweighted graphs.
- **DFS:** go as deep as possible first (recursion or a stack), which is good for "explore everything".
- **Dynamic programming:** break the problem into smaller overlapping subproblems, store their answers (memoisation or a table), and build up the final answer.

### Why frontend interviews ask DSA

Even UI-focused companies run a coding round. Frontend versions often use **trees (the DOM)**, **flattening and unflattening objects**, **list-to-tree conversion**, **pagination**, **search highlighting** and **concurrency** (promise pools). These are covered in the "Frontend-Flavoured" section.

---

## Part B — Problems with Explanations

Every problem below has four parts: **Short answer** (the approach and complexity, to say first), **Explanation** (the idea and why it works), **Example** (the code, often with a sample input) and **Say it like this** (how to talk through it while coding).

## 🟢 Easy

**Q1. Two Sum — return the indexes of the two numbers that add up to a target.**

**Short answer:** One pass with a hash map from value to index; for each number, check whether `target − num` was already seen. O(n) time, O(n) space.

**Explanation:** The brute force checks every pair in O(n²). Storing seen numbers in a Map turns "have I seen the partner?" into an O(1) lookup.

**Example:**

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
twoSum([2, 7, 11, 15], 9); // [0, 1]
```

**Say it like this:** "Brute force is O(n²). Instead, while scanning I ask whether I've already seen the number that completes the pair; a Map answers that in O(1), so it's one pass."

---

**Q2. Valid Anagram — do two strings contain the same letters with the same counts?**

**Short answer:** Count characters of the first string and decrement for the second; any count going below zero means false. O(n) time.

**Explanation:** Equal lengths are a quick early exit. Sorting both strings also works in O(n log n).

**Example:**

```js
function isAnagram(a, b) {
  if (a.length !== b.length) return false;
  const count = new Map();
  for (const c of a) count.set(c, (count.get(c) ?? 0) + 1);
  for (const c of b) { if (!count.get(c)) return false; count.set(c, count.get(c) - 1); }
  return true;
}
isAnagram('listen', 'silent'); // true
```

**Say it like this:** "A frequency map makes it linear; sorting is simpler to write but O(n log n)."

---

**Q3. Valid Palindrome — ignoring non-alphanumeric characters and case.**

**Short answer:** Two pointers from both ends, skipping non-alphanumerics and comparing case-insensitively. O(n) time, O(1) space.

**Explanation:** Comparing in place avoids building a cleaned copy of the string.

**Example:**

```js
function isPalindrome(s) {
  const ok = (c) => /[a-z0-9]/i.test(c);
  let l = 0, r = s.length - 1;
  while (l < r) {
    if (!ok(s[l])) { l++; continue; }
    if (!ok(s[r])) { r--; continue; }
    if (s[l].toLowerCase() !== s[r].toLowerCase()) return false;
    l++; r--;
  }
  return true;
}
isPalindrome('A man, a plan, a canal: Panama'); // true
```

**Say it like this:** "Two pointers moving inwards, skipping punctuation, so it's linear time and constant space."

---

**Q4. Valid Parentheses — is a bracket string balanced?**

**Short answer:** Use a stack: push openers, and each closer must match the top. The stack must end empty. O(n).

**Explanation:** The most recent unmatched opener must close first, which is exactly LIFO order.

**Example:**

```js
function isValid(s) {
  const pair = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  for (const c of s) {
    if (!(c in pair)) stack.push(c);
    else if (stack.pop() !== pair[c]) return false;
  }
  return stack.length === 0;
}
isValid('({[]})'); // true
isValid('(]');     // false
```

**Say it like this:** "Brackets close in reverse order of opening, which is a stack. The same idea validates HTML tag nesting."

---

**Q5. Best Time to Buy and Sell a Stock — maximum profit from one buy then one sell.**

**Short answer:** Track the lowest price so far and the best `price − min`. O(n) time, O(1) space.

**Explanation:** The best sale on any day uses the cheapest earlier buy.

**Example:**

```js
function maxProfit(prices) {
  let min = Infinity, best = 0;
  for (const p of prices) { min = Math.min(min, p); best = Math.max(best, p - min); }
  return best;
}
maxProfit([7, 1, 5, 3, 6, 4]); // 5
```

**Say it like this:** "One pass keeping the minimum so far; each day's best profit is today minus that minimum."

---

**Q6. Maximum Subarray (Kadane's Algorithm) — largest sum of a contiguous subarray.**

**Short answer:** At each element, either extend the current sum or restart from this element; track the best. O(n).

**Explanation:** A negative running sum can only hurt what follows, so you drop it.

**Example:**

```js
function maxSubArray(nums) {
  let cur = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) { cur = Math.max(nums[i], cur + nums[i]); best = Math.max(best, cur); }
  return best;
}
maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]); // 6
```

**Say it like this:** "Kadane's: keep extending while the running sum helps, restart when it doesn't."

---

**Q7. Contains Duplicate — does any value appear twice?**

**Short answer:** Compare `new Set(nums).size` with `nums.length`. O(n) time and space.

**Explanation:** A Set drops duplicates, so a smaller size means a duplicate existed. Early exit is possible by checking membership while adding.

**Example:**

```js
const containsDuplicate = (nums) => new Set(nums).size !== nums.length;
```

**Say it like this:** "A Set does it in one line and linear time."

---

**Q8. Reverse a Linked List.**

**Short answer:** Walk the list flipping each `next` pointer, using `prev`, `current` and `next` variables. O(n) time, O(1) space.

**Explanation:** Save the next node before overwriting the pointer, or you lose the rest of the list.

**Example:**

```js
function reverseList(head) {
  let prev = null;
  while (head) { const next = head.next; head.next = prev; prev = head; head = next; }
  return prev;
}
// 1 → 2 → 3  becomes  3 → 2 → 1
```

**Say it like this:** "Save next, flip the pointer, advance both; at the end `prev` is the new head."

---

**Q9. Merge Two Sorted Lists.**

**Short answer:** A dummy head, repeatedly attaching the smaller current node, then the remainder. O(n + m).

**Explanation:** The dummy node avoids special-casing the first node.

**Example:**

```js
function mergeTwoLists(a, b) {
  const dummy = { next: null }; let tail = dummy;
  while (a && b) {
    if (a.val <= b.val) { tail.next = a; a = a.next; } else { tail.next = b; b = b.next; }
    tail = tail.next;
  }
  tail.next = a ?? b;
  return dummy.next;
}
```

**Say it like this:** "Like the merge step of merge sort, with a dummy head to keep the code simple."

---

**Q10. Linked List Cycle (Floyd's Tortoise and Hare).**

**Short answer:** Slow moves 1, fast moves 2; if they meet there's a cycle. O(n) time, O(1) space.

**Explanation:** In a cycle the fast pointer gains one step per move and must eventually land on the slow one.

**Example:**

```js
function hasCycle(head) {
  let slow = head, fast = head;
  while (fast?.next) { slow = slow.next; fast = fast.next.next; if (slow === fast) return true; }
  return false;
}
```

**Say it like this:** "Two speeds on a loop always meet; a Set of visited nodes works too but costs O(n) space."

---

**Q11. Binary Search — find a target in a sorted array.**

**Short answer:** Compare with the middle and discard the half that can't contain the target. O(log n).

**Explanation:** Use `l <= r`, and move `l = m + 1` or `r = m − 1` to avoid infinite loops.

**Example:**

```js
function search(a, target) {
  let l = 0, r = a.length - 1;
  while (l <= r) {
    const m = (l + r) >> 1;
    if (a[m] === target) return m;
    if (a[m] < target) l = m + 1; else r = m - 1;
  }
  return -1;
}
```

**Say it like this:** "Halve the search space each step; the boundaries are where bugs hide, so I keep them consistent."

---

**Q12. Maximum Depth of a Binary Tree.**

**Short answer:** Depth = 1 + max(depth of left, depth of right), with empty trees at 0. O(n).

**Explanation:** Recursion uses O(h) stack space, where h is the height.

**Example:**

```js
const maxDepth = (node) => (node ? 1 + Math.max(maxDepth(node.left), maxDepth(node.right)) : 0);
```

**Say it like this:** "The tree's depth is one more than its deeper subtree; a one-line recursion."

---

**Q13. Invert a Binary Tree.**

**Short answer:** Swap left and right children at every node recursively. O(n).

**Explanation:** Each node is visited once; the swap can happen before or after recursing.

**Example:**

```js
function invert(node) {
  if (!node) return node;
  [node.left, node.right] = [invert(node.right), invert(node.left)];
  return node;
}
```

**Say it like this:** "Swap children at each node, recursively; it's a mirror image."

---

**Q14. Climbing Stairs — ways to reach step n taking 1 or 2 steps.**

**Short answer:** `ways(n) = ways(n−1) + ways(n−2)`, i.e. Fibonacci, keeping only the last two values. O(n) time, O(1) space.

**Explanation:** The last move came from n−1 or n−2, so the counts add.

**Example:**

```js
function climbStairs(n) { let a = 1, b = 1; for (let i = 2; i <= n; i++) [a, b] = [b, a + b]; return b; }
climbStairs(5); // 8
```

**Say it like this:** "The recurrence is Fibonacci; I only need the previous two values, so constant space."

---

**Q15. First Unique Character — index of the first non-repeating character.**

**Short answer:** Count characters, then return the first index with count 1. O(n).

**Explanation:** Two passes: one to count, one to find in original order.

**Example:**

```js
function firstUniqChar(s) {
  const count = new Map();
  for (const ch of s) count.set(ch, (count.get(ch) ?? 0) + 1);
  for (let i = 0; i < s.length; i++) if (count.get(s[i]) === 1) return i;
  return -1;
}
firstUniqChar('leetcode'); // 0
```

**Say it like this:** "Count first, then scan in order for the first count of one."

---

**Q16. Move Zeroes — move all zeroes to the end in place, keeping order.**

**Short answer:** A write pointer for the next non-zero position while a read pointer scans; swap when non-zero. O(n), O(1) space.

**Explanation:** Non-zero elements keep their relative order because they're written in scan order.

**Example:**

```js
function moveZeroes(a) {
  let write = 0;
  for (let read = 0; read < a.length; read++) {
    if (a[read] !== 0) { [a[write], a[read]] = [a[read], a[write]]; write++; }
  }
  return a;
}
moveZeroes([0, 1, 0, 3, 12]); // [1, 3, 12, 0, 0]
```

**Say it like this:** "Read pointer scans, write pointer marks where the next non-zero goes."

---

## 🟡 Medium

**Q17. Longest Substring Without Repeating Characters.**

**Short answer:** A sliding window: expand right; if the character was seen inside the window, jump left past its last index. O(n).

**Explanation:** Storing each character's last index lets the left edge jump directly instead of stepping.

**Example:**

```js
function lengthOfLongestSubstring(s) {
  const last = new Map(); let l = 0, best = 0;
  for (let r = 0; r < s.length; r++) {
    if (last.has(s[r]) && last.get(s[r]) >= l) l = last.get(s[r]) + 1;
    last.set(s[r], r);
    best = Math.max(best, r - l + 1);
  }
  return best;
}
lengthOfLongestSubstring('abcabcbb'); // 3
```

**Say it like this:** "The window always holds unique characters; on a repeat I move the left edge just past the previous occurrence."

---

**Q18. Group Anagrams.**

**Short answer:** Use each word's sorted letters as a Map key. O(n · k log k).

**Explanation:** Anagrams share the same sorted form. A 26-letter count key avoids sorting for lowercase input.

**Example:**

```js
function groupAnagrams(strs) {
  const groups = new Map();
  for (const s of strs) {
    const key = [...s].sort().join('');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
  }
  return [...groups.values()];
}
```

**Say it like this:** "Anagrams have identical sorted letters, so that's my grouping key."

---

**Q19. Top K Frequent Elements.**

**Short answer:** Count frequencies, bucket numbers by count, and read buckets from highest. O(n).

**Explanation:** Bucket sort avoids an O(n log n) sort because counts are at most n.

**Example:**

```js
function topKFrequent(nums, k) {
  const freq = new Map();
  for (const n of nums) freq.set(n, (freq.get(n) ?? 0) + 1);
  const buckets = Array.from({ length: nums.length + 1 }, () => []);
  for (const [n, c] of freq) buckets[c].push(n);
  const out = [];
  for (let c = buckets.length - 1; c >= 0 && out.length < k; c--) out.push(...buckets[c]);
  return out.slice(0, k);
}
```

**Say it like this:** "Counts are bounded by n, so bucket sort gives linear time instead of sorting."

---

**Q20. Product of Array Except Self (without division).**

**Short answer:** Each answer is prefix product × suffix product; compute prefixes in one pass and multiply suffixes in a second. O(n).

**Explanation:** Using the output array for prefixes gives O(1) extra space.

**Example:**

```js
function productExceptSelf(nums) {
  const out = Array(nums.length).fill(1);
  let prefix = 1;
  for (let i = 0; i < nums.length; i++) { out[i] = prefix; prefix *= nums[i]; }
  let suffix = 1;
  for (let i = nums.length - 1; i >= 0; i--) { out[i] *= suffix; suffix *= nums[i]; }
  return out;
}
productExceptSelf([1, 2, 3, 4]); // [24, 12, 8, 6]
```

**Say it like this:** "Everything to the left times everything to the right, built in two passes."

---

**Q21. 3Sum — all unique triplets summing to zero.**

**Short answer:** Sort, fix one number, find pairs with two pointers, and skip duplicates. O(n²).

**Explanation:** Sorting enables two pointers and makes duplicate-skipping easy.

**Example:**

```js
function threeSum(nums) {
  nums.sort((a, b) => a - b); const res = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i && nums[i] === nums[i - 1]) continue;
    let l = i + 1, r = nums.length - 1;
    while (l < r) {
      const sum = nums[i] + nums[l] + nums[r];
      if (sum === 0) { res.push([nums[i], nums[l], nums[r]]); while (nums[l] === nums[l + 1]) l++; while (nums[r] === nums[r - 1]) r--; l++; r--; }
      else if (sum < 0) l++; else r--;
    }
  }
  return res;
}
```

**Say it like this:** "Sort, anchor one value, then two-sum with pointers, skipping duplicates at each level."

---

**Q22. Container With Most Water.**

**Short answer:** Two pointers at the ends; compute area and move the shorter side inwards. O(n).

**Explanation:** Area is limited by the shorter line, so moving the taller one can never increase it.

**Example:**

```js
function maxArea(h) {
  let l = 0, r = h.length - 1, best = 0;
  while (l < r) { best = Math.max(best, Math.min(h[l], h[r]) * (r - l)); if (h[l] < h[r]) l++; else r--; }
  return best;
}
```

**Say it like this:** "Always move the shorter wall, because it's the only move that could find a bigger area."

---

**Q23. Subarray Sum Equals K.**

**Short answer:** Prefix sums with a Map of how often each sum has appeared; add `count[sum − k]` at each step. O(n).

**Explanation:** A subarray sums to k when two prefix sums differ by k. Unlike a sliding window, it works with negatives.

**Example:**

```js
function subarraySum(nums, k) {
  const seen = new Map([[0, 1]]); let sum = 0, count = 0;
  for (const n of nums) { sum += n; count += seen.get(sum - k) ?? 0; seen.set(sum, (seen.get(sum) ?? 0) + 1); }
  return count;
}
```

**Say it like this:** "Prefix sums turn 'subarray sums to k' into 'have I seen sum minus k', which a Map answers in O(1)."

---

**Q24. Merge Intervals.**

**Short answer:** Sort by start; extend the last interval when the next overlaps, otherwise start a new one. O(n log n).

**Explanation:** After sorting, overlaps can only happen with the most recent merged interval.

**Example:**

```js
function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]); const out = [];
  for (const [s, e] of intervals) {
    const last = out.at(-1);
    if (last && s <= last[1]) last[1] = Math.max(last[1], e); else out.push([s, e]);
  }
  return out;
}
merge([[1, 3], [2, 6], [8, 10]]); // [[1,6],[8,10]]
```

**Say it like this:** "Sort, then sweep and merge; it's how I'd merge highlighted transcript segments."

---

**Q25. Meeting Rooms II — minimum rooms needed.**

**Short answer:** Sort starts and ends separately and sweep: a start before the earliest end needs a new room. O(n log n).

**Explanation:** The number of overlapping meetings at any time is the number of rooms.

**Example:**

```js
function minMeetingRooms(iv) {
  const starts = iv.map((i) => i[0]).sort((a, b) => a - b);
  const ends = iv.map((i) => i[1]).sort((a, b) => a - b);
  let rooms = 0, e = 0;
  for (const s of starts) { if (s < ends[e]) rooms++; else e++; }
  return rooms;
}
```

**Say it like this:** "A sweep line over start and end times counts the peak overlap."

---

**Q26. Daily Temperatures — days until a warmer temperature.**

**Short answer:** A monotonic stack of indexes with decreasing temperatures; a warmer day pops and resolves them. O(n).

**Explanation:** Each index is pushed and popped once.

**Example:**

```js
function dailyTemperatures(t) {
  const res = Array(t.length).fill(0), stack = [];
  for (let i = 0; i < t.length; i++) {
    while (stack.length && t[i] > t[stack.at(-1)]) { const j = stack.pop(); res[j] = i - j; }
    stack.push(i);
  }
  return res;
}
```

**Say it like this:** "'Next greater element' problems are monotonic stacks: waiting items sit on the stack until something bigger arrives."

---

**Q27. Min Stack — getMin in O(1).**

**Short answer:** Keep a parallel stack of the minimum at each depth.

**Explanation:** When you pop, the previous minimum is restored automatically.

**Example:**

```js
class MinStack {
  stack = []; mins = [];
  push(x) { this.stack.push(x); this.mins.push(Math.min(x, this.mins.at(-1) ?? Infinity)); }
  pop() { this.stack.pop(); this.mins.pop(); }
  top() { return this.stack.at(-1); }
  getMin() { return this.mins.at(-1); }
}
```

**Say it like this:** "A second stack remembers the minimum at every depth, so every operation is O(1)."

---

**Q28. Search in a Rotated Sorted Array.**

**Short answer:** Binary search, deciding which half is sorted and whether the target lies within it. O(log n).

**Explanation:** At least one half is always sorted, so you can test the target against its range.

**Example:**

```js
function searchRotated(a, target) {
  let l = 0, r = a.length - 1;
  while (l <= r) {
    const m = (l + r) >> 1;
    if (a[m] === target) return m;
    if (a[l] <= a[m]) { if (a[l] <= target && target < a[m]) r = m - 1; else l = m + 1; }
    else { if (a[m] < target && target <= a[r]) l = m + 1; else r = m - 1; }
  }
  return -1;
}
```

**Say it like this:** "One half is always sorted, so I check if the target is inside that half and discard the other."

---

**Q29. Koko Eating Bananas — minimum speed to finish within h hours.**

**Short answer:** Binary search the answer between 1 and the largest pile, checking feasibility at each speed. O(n log max).

**Explanation:** If a speed works, every faster speed works too: a monotonic condition.

**Example:**

```js
function minEatingSpeed(piles, h) {
  let l = 1, r = Math.max(...piles);
  while (l < r) {
    const k = (l + r) >> 1;
    const hours = piles.reduce((s, p) => s + Math.ceil(p / k), 0);
    if (hours <= h) r = k; else l = k + 1;
  }
  return l;
}
```

**Say it like this:** "I'm binary-searching the answer space, because the yes/no condition flips exactly once."

---

**Q30. Binary Tree Level-Order Traversal.**

**Short answer:** BFS one level at a time, building the next level array. O(n).

**Explanation:** Building a new array per level avoids `shift()`, which is O(n).

**Example:**

```js
function levelOrder(root) {
  if (!root) return [];
  const result = []; let level = [root];
  while (level.length) {
    result.push(level.map((n) => n.val));
    level = level.flatMap((n) => [n.left, n.right].filter(Boolean));
  }
  return result;
}
```

**Say it like this:** "BFS processes the tree level by level; I use level arrays instead of a shifting queue."

---

**Q31. Validate a Binary Search Tree.**

**Short answer:** Recurse with a (low, high) range inherited from ancestors; every node must lie strictly inside it. O(n).

**Explanation:** Comparing only parent and child misses violations deeper in the tree.

**Example:**

```js
function isValidBST(node, lo = -Infinity, hi = Infinity) {
  if (!node) return true;
  if (node.val <= lo || node.val >= hi) return false;
  return isValidBST(node.left, lo, node.val) && isValidBST(node.right, node.val, hi);
}
```

**Say it like this:** "Each node carries bounds from all its ancestors, not just its parent."

---

**Q32. Lowest Common Ancestor (Binary Tree).**

**Short answer:** Recurse; if p and q are found in different subtrees, the current node is the LCA, otherwise pass up whichever side found one. O(n).

**Explanation:** Returning the node when it equals p or q handles the case where one is an ancestor of the other.

**Example:**

```js
function lca(root, p, q) {
  if (!root || root === p || root === q) return root;
  const left = lca(root.left, p, q), right = lca(root.right, p, q);
  return left && right ? root : left ?? right;
}
```

**Say it like this:** "The first node where p and q split into different subtrees is the answer."

---

**Q33. Number of Islands.**

**Short answer:** Scan the grid; each unvisited land cell starts a new island, and DFS sinks its connected land. O(rows × cols).

**Explanation:** Marking visited cells prevents counting an island twice.

**Example:**

```js
function numIslands(grid) {
  let count = 0;
  const sink = (r, c) => {
    if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] !== '1') return;
    grid[r][c] = '0'; sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1);
  };
  for (let r = 0; r < grid.length; r++) for (let c = 0; c < grid[0].length; c++) if (grid[r][c] === '1') { count++; sink(r, c); }
  return count;
}
```

**Say it like this:** "Count each new piece of land, then flood-fill it so it's never counted again."

---

**Q34. Rotting Oranges — minutes until all oranges rot.**

**Short answer:** Multi-source BFS from all rotten oranges; each BFS level is one minute. O(rows × cols).

**Explanation:** Starting from every source at once gives the correct simultaneous spread.

**Example:**

```js
function orangesRotting(grid) {
  let queue = [], fresh = 0, minutes = 0;
  grid.forEach((row, r) => row.forEach((v, c) => { if (v === 2) queue.push([r, c]); if (v === 1) fresh++; }));
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (queue.length && fresh) {
    const next = [];
    for (const [r, c] of queue) for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (grid[nr]?.[nc] === 1) { grid[nr][nc] = 2; fresh--; next.push([nr, nc]); }
    }
    queue = next; minutes++;
  }
  return fresh ? -1 : minutes;
}
```

**Say it like this:** "BFS from all sources at once, where each level is one minute."

---

**Q35. Course Schedule — can all courses be finished (is there a cycle)?**

**Short answer:** Kahn's algorithm: repeatedly take courses with in-degree 0; if all are processed, there's no cycle. O(V + E).

**Explanation:** Courses stuck with remaining in-degree are part of a cycle.

**Example:**

```js
function canFinish(n, prereqs) {
  const indeg = Array(n).fill(0), adj = Array.from({ length: n }, () => []);
  for (const [course, pre] of prereqs) { adj[pre].push(course); indeg[course]++; }
  const queue = []; indeg.forEach((d, i) => d === 0 && queue.push(i));
  let done = 0;
  for (let i = 0; i < queue.length; i++) { done++; for (const next of adj[queue[i]]) if (--indeg[next] === 0) queue.push(next); }
  return done === n;
}
```

**Say it like this:** "Topological sort; bundlers and spreadsheet recalculation use the same idea."

---

**Q36. Permutations.**

**Short answer:** Backtracking: choose an unused number, recurse, then undo. O(n · n!).

**Explanation:** The "undo" step (backtrack) restores state so the next choice starts clean.

**Example:**

```js
function permute(nums) {
  const result = [], path = [], used = Array(nums.length).fill(false);
  (function bt() {
    if (path.length === nums.length) return result.push([...path]);
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true; path.push(nums[i]); bt(); path.pop(); used[i] = false;
    }
  })();
  return result;
}
```

**Say it like this:** "Choose, explore, un-choose: that's the backtracking template."

---

**Q37. Subsets.**

**Short answer:** Start with `[[]]`; each new number doubles the list by adding it to every existing subset. O(n · 2ⁿ).

**Explanation:** Every element is either in or out of a subset.

**Example:**

```js
const subsets = (nums) => nums.reduce((acc, n) => acc.concat(acc.map((s) => [...s, n])), [[]]);
subsets([1, 2]); // [[], [1], [2], [1, 2]]
```

**Say it like this:** "Each element doubles the set of subsets, which is why there are 2ⁿ."

---

**Q38. Coin Change — fewest coins to make an amount.**

**Short answer:** DP where `dp[a] = min(dp[a], dp[a − coin] + 1)`, built from 0 upwards. O(amount × coins).

**Explanation:** Greedy fails (coins [1, 3, 4], amount 6: greedy uses 3 coins, optimal uses 2).

**Example:**

```js
function coinChange(coins, amount) {
  const dp = Array(amount + 1).fill(Infinity); dp[0] = 0;
  for (let a = 1; a <= amount; a++) for (const c of coins) if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
  return dp[amount] === Infinity ? -1 : dp[amount];
}
coinChange([1, 2, 5], 11); // 3
```

**Say it like this:** "Greedy doesn't work, so I build the best answer for every smaller amount first."

---

**Q39. House Robber — maximum without robbing adjacent houses.**

**Short answer:** For each house, take max(skip it, rob it + best two back), keeping two variables. O(n), O(1) space.

**Explanation:** Only the previous two results matter.

**Example:**

```js
function rob(nums) { let prev = 0, cur = 0; for (const n of nums) [prev, cur] = [cur, Math.max(cur, prev + n)]; return cur; }
rob([2, 7, 9, 3, 1]); // 12
```

**Say it like this:** "Each house is rob-or-skip, and only the last two totals matter."

---

**Q40. Longest Increasing Subsequence in O(n log n).**

**Short answer:** Keep `tails[i]` = smallest tail of an increasing subsequence of length i+1; binary-search where each number fits. Answer = `tails.length`.

**Explanation:** Smaller tails leave more room to extend later.

**Example:**

```js
function lengthOfLIS(nums) {
  const tails = [];
  for (const x of nums) {
    let l = 0, r = tails.length;
    while (l < r) { const m = (l + r) >> 1; if (tails[m] < x) l = m + 1; else r = m; }
    tails[l] = x;
  }
  return tails.length;
}
lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18]); // 4
```

**Say it like this:** "I keep the smallest possible tail for each length, and binary search where each number belongs."

---

**Q41. Word Break — can a string be split into dictionary words?**

**Short answer:** `dp[i]` is true if `s[0..i)` can be split; check every split point j where `dp[j]` is true and `s[j..i)` is a word. O(n²).

**Explanation:** A Set makes word lookups O(1) (ignoring substring cost).

**Example:**

```js
function wordBreak(s, dict) {
  const words = new Set(dict), dp = Array(s.length + 1).fill(false); dp[0] = true;
  for (let i = 1; i <= s.length; i++) for (let j = 0; j < i; j++) if (dp[j] && words.has(s.slice(j, i))) { dp[i] = true; break; }
  return dp[s.length];
}
wordBreak('leetcode', ['leet', 'code']); // true
```

**Say it like this:** "A prefix is breakable if some shorter breakable prefix plus one dictionary word makes it."

---

**Q42. Kth Largest Element.**

**Short answer:** Quickselect: partition and recurse into only the side containing the target index. O(n) average; a size-k min-heap is O(n log k).

**Explanation:** Unlike sorting, you only process one side after each partition.

**Example:**

```js
function findKthLargest(nums, k) {
  const target = nums.length - k; let l = 0, r = nums.length - 1;
  while (true) {
    const pivot = nums[r]; let p = l;
    for (let i = l; i < r; i++) if (nums[i] <= pivot) { [nums[i], nums[p]] = [nums[p], nums[i]]; p++; }
    [nums[p], nums[r]] = [nums[r], nums[p]];
    if (p === target) return nums[p];
    if (p < target) l = p + 1; else r = p - 1;
  }
}
```

**Say it like this:** "Quickselect is quicksort that only recurses into one side, so it's linear on average."

---

**Q43. LRU Cache — get and put in O(1), evicting the least recently used.**

**Short answer:** A JavaScript Map keeps insertion order: re-insert on access, and evict the first key when over capacity.

**Explanation:** In other languages this is a hash map plus a doubly linked list; Map gives the same behaviour.

**Example:**

```js
class LRUCache {
  constructor(capacity) { this.capacity = capacity; this.map = new Map(); }
  get(key) { if (!this.map.has(key)) return -1; const v = this.map.get(key); this.map.delete(key); this.map.set(key, v); return v; }
  put(key, value) {
    this.map.delete(key); this.map.set(key, value);
    if (this.map.size > this.capacity) this.map.delete(this.map.keys().next().value);
  }
}
```

**Say it like this:** "Map's insertion order gives O(1) LRU in JavaScript; I can write the linked-list version if you'd like."

---

**Q44. Implement a Trie (for autocomplete).**

**Short answer:** Nodes with a children Map and an `end` flag; insert walks or creates nodes; suggestions walk to the prefix and DFS below it.

**Explanation:** Lookup cost depends on prefix length, not on the number of words.

**Example:**

```js
class Trie {
  root = { children: new Map(), end: false };
  insert(word) { let n = this.root; for (const ch of word) { if (!n.children.has(ch)) n.children.set(ch, { children: new Map(), end: false }); n = n.children.get(ch); } n.end = true; }
  suggest(prefix, limit = 5) {
    let n = this.root; for (const ch of prefix) { n = n.children.get(ch); if (!n) return []; }
    const out = [];
    (function dfs(node, acc) { if (out.length >= limit) return; if (node.end) out.push(acc); for (const [ch, c] of node.children) dfs(c, acc + ch); })(n, prefix);
    return out;
  }
}
```

**Say it like this:** "A trie shares prefixes, so finding completions is walking to the prefix and collecting below it."

---

## 🔴 Hard (Senior and Product Companies)

**Q45. Minimum Window Substring — smallest substring of s containing all characters of t.**

**Short answer:** Sliding window: expand right until all needed characters are covered, then shrink left while still valid, recording the best. O(|s| + |t|).

**Explanation:** A `missing` counter tracks how many required characters are still needed.

**Example:**

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
minWindow('ADOBECODEBANC', 'ABC'); // "BANC"
```

**Say it like this:** "Grow until valid, shrink while valid, and record the smallest valid window."

---

**Q46. Sliding Window Maximum.**

**Short answer:** A monotonic deque of indexes with decreasing values; the front is the window max. O(n).

**Explanation:** Smaller values behind a newer larger value can never be the max, so they're dropped.

**Example:**

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

**Say it like this:** "The deque keeps only candidates that could still be a maximum, so each element enters and leaves once."

---

**Q47. Merge K Sorted Lists.**

**Short answer:** Merge pairs of lists in rounds, like a tournament, reusing `mergeTwoLists`. O(N log k).

**Explanation:** Each round halves the number of lists; a min-heap gives the same complexity.

**Example:**

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

**Say it like this:** "Pairwise merging gives log k rounds over N nodes."

---

**Q48. Trapping Rain Water.**

**Short answer:** Two pointers tracking left and right maxima; move the side with the lower max and add `max − height`. O(n), O(1).

**Explanation:** Water above a bar is limited by the smaller of the tallest bars on each side; the lower side is already determined.

**Example:**

```js
function trap(h) {
  let l = 0, r = h.length - 1, lmax = 0, rmax = 0, water = 0;
  while (l < r) {
    if (h[l] < h[r]) { lmax = Math.max(lmax, h[l]); water += lmax - h[l]; l++; }
    else { rmax = Math.max(rmax, h[r]); water += rmax - h[r]; r--; }
  }
  return water;
}
trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]); // 6
```

**Say it like this:** "The lower side's water level is already known, so I resolve that side and move inwards."

---

**Q49. Serialise and Deserialise a Binary Tree.**

**Short answer:** Pre-order traversal with `#` for nulls, and rebuild by reading values in the same order. O(n).

**Explanation:** The null markers capture the exact shape.

**Example:**

```js
const serialize = (root) => { const out = []; (function w(n) { if (!n) return out.push('#'); out.push(n.val); w(n.left); w(n.right); })(root); return out.join(','); };
const deserialize = (data) => { const v = data.split(','); let i = 0; return (function b() { const x = v[i++]; if (x === '#') return null; return { val: +x, left: b(), right: b() }; })(); };
```

**Say it like this:** "Pre-order plus null markers is enough to rebuild the exact tree."

---

**Q50. Edit Distance — minimum inserts, deletes and replaces to turn a into b.**

**Short answer:** `dp[i][j]` = distance between prefixes; matching characters take the diagonal, otherwise 1 + min(replace, delete, insert). O(m·n).

**Explanation:** It's the basis of diffing and fuzzy search.

**Example:**

```js
function minDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
  return dp[a.length][b.length];
}
minDistance('horse', 'ros'); // 3
```

**Say it like this:** "Each cell is the cheapest of the three edits from a neighbouring subproblem."

---

**Q51. Median from a Data Stream.**

**Short answer:** Two heaps, a max-heap for the lower half and a min-heap for the upper half, kept balanced. Add in O(log n), median in O(1).

**Explanation:** The median is the top of the larger heap, or the average of both tops. JavaScript has no built-in heap, so you'd write a small one.

**Example:**

```text
add 5 → low [5]           median 5
add 2 → low [2] high [5]  median 3.5
add 8 → low [2,5] high [8] median 5
```

**Say it like this:** "Two balanced heaps keep the middle values at the tops; I can write the heap class or treat it as a helper."

---

## 🌐 Frontend-Flavoured DSA (Very Common in UI Interviews)

**Q52. Flatten a nested object to dot paths.**

**Short answer:** Recurse through plain objects, building `prefix.key` paths, and store leaf values. O(total keys).

**Explanation:** Arrays and other values are treated as leaves here; adjust if the interviewer wants arrays indexed.

**Example:**

```js
function flattenObject(obj, prefix = '', out = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) flattenObject(value, path, out); else out[path] = value;
  }
  return out;
}
flattenObject({ user: { name: 'Asha', address: { city: 'Pune' } } }); // { 'user.name': 'Asha', 'user.address.city': 'Pune' }
```

**Say it like this:** "Recursion with a path prefix; this is how form libraries and translation keys are flattened."

---

**Q53. Unflatten dot paths back into a nested object.**

**Short answer:** Split each path and walk or create nested objects, assigning the value at the last key. O(total path segments).

**Explanation:** `??=` creates intermediate objects only when missing.

**Example:**

```js
function unflatten(flat) {
  const out = {};
  for (const [path, value] of Object.entries(flat)) {
    const keys = path.split('.'); let cur = out;
    keys.forEach((k, i) => { cur = cur[k] ??= i === keys.length - 1 ? value : {}; });
  }
  return out;
}
```

**Say it like this:** "Walk each path, creating objects as needed, and set the value at the end."

---

**Q54. Convert a flat list with `parentId` into a tree.**

**Short answer:** Index all nodes by ID in a Map, then attach each node to its parent (or the roots) in one pass. O(n).

**Explanation:** A nested search for each parent would be O(n²).

**Example:**

```js
function toTree(items) {
  const map = new Map(items.map((i) => [i.id, { ...i, children: [] }])), roots = [];
  for (const node of map.values()) {
    const parent = node.parentId != null ? map.get(node.parentId) : null;
    (parent ? parent.children : roots).push(node);
  }
  return roots;
}
```

**Say it like this:** "Index by ID first, then attach in a single pass; APIs often return threaded comments flat like this."

---

**Q55. Find all DOM nodes matching a predicate.**

**Short answer:** Iterative DFS with a stack, pushing children in reverse to keep document order. O(n).

**Explanation:** Iteration avoids recursion limits on deep DOMs.

**Example:**

```js
function findAll(root, predicate) {
  const out = [], stack = [root];
  while (stack.length) {
    const node = stack.pop();
    if (predicate(node)) out.push(node);
    for (let i = node.children.length - 1; i >= 0; i--) stack.push(node.children[i]);
  }
  return out;
}
findAll(document.body, (el) => el.tagName === 'BUTTON' && !el.hasAttribute('aria-label'));
```

**Say it like this:** "The DOM is a tree, so it's a DFS; I used something like this to find unlabelled buttons in an accessibility audit."

---

**Q56. Find the corresponding node in an identical DOM tree.**

**Short answer:** Record the child-index path from the node up to its root, then replay it down the other tree. O(depth × siblings).

**Explanation:** Identical structure means the same index path leads to the matching node.

**Example:**

```js
function findMirror(rootA, rootB, nodeA) {
  const path = [];
  for (let n = nodeA; n !== rootA; n = n.parentElement) path.push([...n.parentElement.children].indexOf(n));
  return path.reverse().reduce((n, i) => n.children[i], rootB);
}
```

**Say it like this:** "Record how to reach the node as child indexes, then follow the same path in the other tree."

---

**Q57. Lowest common ancestor of two DOM nodes.**

**Short answer:** Collect all of a's ancestors in a Set, then walk up from b until one is found. O(depth).

**Explanation:** DOM nodes have parent pointers, which makes this simpler than the binary-tree version.

**Example:**

```js
function domLCA(a, b) {
  const ancestors = new Set();
  for (let n = a; n; n = n.parentElement) ancestors.add(n);
  for (let n = b; n; n = n.parentElement) if (ancestors.has(n)) return n;
  return null;
}
```

**Say it like this:** "Parent pointers make it easy: store one path upwards and walk the other until they meet."

---

**Q58. Highlight search matches in text without `innerHTML`.**

**Short answer:** Escape the query, split the text with a capturing regex, and return segments flagged as matches for React to render.

**Explanation:** Returning segments rather than HTML keeps React's escaping and avoids XSS; escaping the query prevents regex errors.

**Example:**

```js
function highlight(text, query) {
  if (!query) return [{ text, match: false }];
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.split(new RegExp(`(${escaped})`, 'gi')).filter(Boolean)
    .map((part) => ({ text: part, match: part.toLowerCase() === query.toLowerCase() }));
}
```

**Say it like this:** "I return segments so React escapes everything, and I escape the query so special characters can't break the regex."

---

**Q59. Pagination window with ellipsis: `1 … 4 5 [6] 7 8 … 20`.**

**Short answer:** Collect the first, last and pages within a radius of the current page, sort them, and insert "…" where gaps exist.

**Explanation:** A Set avoids duplicates near the edges.

**Example:**

```js
function pageWindow(current, total, radius = 2) {
  const pages = new Set([1, total]);
  for (let p = current - radius; p <= current + radius; p++) if (p > 1 && p < total) pages.add(p);
  const sorted = [...pages].sort((a, b) => a - b), out = [];
  sorted.forEach((p, i) => { if (i && p - sorted[i - 1] > 1) out.push('…'); out.push(p); });
  return out;
}
pageWindow(6, 20); // [1, '…', 4, 5, 6, 7, 8, '…', 20]
```

**Say it like this:** "Pick the pages to show, sort them, and add an ellipsis wherever there's a gap."

---

**Q60. Concurrency-limited promise pool.**

**Short answer:** Start N workers that each pull the next task from a shared index until none remain.

**Explanation:** Exactly N tasks run at once; results keep input order.

**Example:**

```js
async function pool(tasks, limit) {
  const results = []; let next = 0;
  const worker = async () => { while (next < tasks.length) { const i = next++; results[i] = await tasks[i](); } };
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}
```

**Say it like this:** "N workers pulling from a shared index keep exactly N requests in flight."

---

**Q61. Group calls by agent and compute average scores.**

**Short answer:** One pass accumulating sum and count per agent in a Map, then map to averages and sort.

**Explanation:** Skipping null scores stops unscored calls dragging averages down.

**Example:**

```js
function averageScoreByAgent(calls) {
  const acc = new Map();
  for (const { agent, score } of calls) {
    if (score == null) continue;
    const a = acc.get(agent) ?? { sum: 0, n: 0 }; a.sum += score; a.n++; acc.set(agent, a);
  }
  return [...acc].map(([agent, { sum, n }]) => ({ agent, avg: +(sum / n).toFixed(1) })).sort((a, b) => b.avg - a.avg);
}
```

**Say it like this:** "Group and aggregate in one pass, skipping nulls explicitly, then sort for the leaderboard."

---

**Q62. Find the active transcript line for a playback time.**

**Short answer:** Binary search the sorted lines for the last line whose start ≤ current time. O(log n).

**Explanation:** `timeupdate` fires several times a second, and transcripts can be long, so linear search is wasteful.

**Example:**

```js
function activeLine(lines, t) {
  let lo = 0, hi = lines.length - 1, ans = -1;
  while (lo <= hi) { const m = (lo + hi) >> 1; if (lines[m].start <= t) { ans = m; lo = m + 1; } else hi = m - 1; }
  return ans;
}
```

**Say it like this:** "Each time update finds the active line in log time, which kept the transcript viewer smooth."

---

**Q63. Merge overlapping time ranges of flagged compliance segments.**

**Short answer:** Same as Merge Intervals (Q24): sort by start and merge overlaps.

**Explanation:** The transcript then highlights clean, non-overlapping ranges.

**Example:**

```js
merge([[12, 20], [18, 25], [40, 44]]); // [[12, 25], [40, 44]]
```

**Say it like this:** "AI flags often overlap, so I merge them before highlighting the transcript."

---

**Q64. Detect circular dependencies in module imports.**

**Short answer:** DFS with three colours (unvisited, in progress, done); reaching an in-progress node means a cycle. O(V + E).

**Explanation:** Kahn's algorithm (Q35) also works.

**Example:**

```js
function hasCycle(graph) {
  const state = new Map();
  const visit = (node) => {
    if (state.get(node) === 1) return true;
    if (state.get(node) === 2) return false;
    state.set(node, 1);
    for (const dep of graph.get(node) ?? []) if (visit(dep)) return true;
    state.set(node, 2);
    return false;
  };
  return [...graph.keys()].some(visit);
}
```

**Say it like this:** "A node that's still on the current DFS path being reached again is a cycle."

---

**Q65. Implement a subset of `JSON.stringify`.**

**Short answer:** Recurse by type: primitives as strings, escaped strings, arrays with `null` for unsupported values, and objects skipping `undefined` and functions.

**Explanation:** A full version also handles cycles, `toJSON`, and `NaN`/`Infinity` (which become `null`).

**Example:**

```js
function stringify(v) {
  if (v === null || typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (typeof v === 'string') return `"${v.replace(/["\\]/g, '\\$&')}"`;
  if (Array.isArray(v)) return `[${v.map((x) => (x === undefined || typeof x === 'function' ? 'null' : stringify(x))).join(',')}]`;
  if (typeof v === 'object') return `{${Object.entries(v).filter(([, x]) => x !== undefined && typeof x !== 'function').map(([k, x]) => `"${k}":${stringify(x)}`).join(',')}}`;
}
```

**Say it like this:** "It's recursion by type, and the interesting details are how undefined and functions behave in objects versus arrays."

---

## 📝 Practice List (Mark Each One When Done)

**Arrays and strings:** Two Sum · Best Time to Buy/Sell · Contains Duplicate · Product Except Self · Maximum Subarray · 3Sum · Container With Most Water · Longest Substring Without Repeating · Longest Repeating Character Replacement · Minimum Window Substring · Group Anagrams · Valid Palindrome · Encode/Decode Strings

**Stack and queue:** Valid Parentheses · Min Stack · Daily Temperatures · Evaluate RPN · Sliding Window Maximum

**Binary search:** Search Rotated · Find Min in Rotated · Koko Bananas · Time-Based Key-Value Store

**Linked list:** Reverse · Merge Two · Cycle · Remove Nth From End · Reorder List · LRU Cache · Merge K

**Trees:** Invert · Max Depth · Same Tree · Subtree · Level Order · Right Side View · Validate BST · Kth Smallest in BST · LCA · Serialize/Deserialize

**Graphs:** Number of Islands · Clone Graph · Rotting Oranges · Pacific Atlantic · Course Schedule I/II · Word Ladder

**Backtracking:** Subsets · Permutations · Combination Sum · Word Search

**Dynamic programming:** Climbing Stairs · House Robber I/II · Coin Change · LIS · Word Break · Longest Common Subsequence · Edit Distance · Unique Paths

**Heaps:** Kth Largest · Top K Frequent · Median of Data Stream · Task Scheduler

**Intervals:** Merge · Insert · Non-overlapping · Meeting Rooms II

**Trie:** Implement Trie · Word Search II (stretch)

**Study tip:** For each problem, write down the pattern name and a one-line idea. In the interview, recognising the pattern quickly is worth more than remembering the code.
