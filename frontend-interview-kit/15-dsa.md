# 15 — DSA for Frontend Engineers (JavaScript)

Frontend DSA rounds favour arrays, strings, hash maps, two pointers, sliding windows, stacks, trees (the DOM is a tree!), BFS and DFS, and light dynamic programming. Learn the **pattern**, and say the complexity out loud.

**How this file is organised**

- **Part A — Understand the topic:** Big-O, the core data structures, and the main problem-solving patterns, explained simply.
- **Part B — Problems with explanations:** Easy → Medium → Hard → Frontend-flavoured → Practice list.

Each problem has a **Problem** statement, the **Idea** (how to think about it), **Code**, **Complexity**, and often a **Say it like this** explanation to speak while coding.

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

## 🟢 Easy

**Q1. Two Sum**

**Problem:** Given an array of numbers and a target, return the indexes of the two numbers that add up to the target.

**Idea:** For each number, the partner we need is `target − num`. Store each number we've seen in a hash map (number → index), so checking for the partner is O(1).

```js
function twoSum(nums, target) {
  const seen = new Map();                 // value → index
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}
twoSum([2, 7, 11, 15], 9); // [0, 1]
```

**Complexity:** O(n) time, O(n) space.

**Say it like this:** "The brute force checks every pair, which is O(n²). Instead, while scanning, I ask: have I already seen the number that completes this pair? A Map answers that in O(1), so the whole thing is one pass."

---

**Q2. Valid Anagram**

**Problem:** Do two strings contain exactly the same letters with the same counts? (`"listen"` and `"silent"` → true)

**Idea:** Count the characters of the first string, then decrement the counts for the second. If any count would go below zero, they aren't anagrams.

```js
function isAnagram(a, b) {
  if (a.length !== b.length) return false;
  const count = new Map();
  for (const c of a) count.set(c, (count.get(c) ?? 0) + 1);
  for (const c of b) {
    if (!count.get(c)) return false;
    count.set(c, count.get(c) - 1);
  }
  return true;
}
```

**Complexity:** O(n) time, O(k) space, where k is the number of distinct characters. Sorting both strings also works, at O(n log n).

---

**Q3. Valid Palindrome (Ignoring Non-Alphanumeric Characters)**

**Problem:** `"A man, a plan, a canal: Panama"` → true.

**Idea:** Two pointers, one at each end. Skip characters that aren't letters or digits, and compare case-insensitively as the pointers move inwards.

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
```

**Complexity:** O(n) time, O(1) space.

---

**Q4. Valid Parentheses**

**Problem:** Is `"({[]})"` correctly balanced? Is `"(]"`?

**Idea:** Use a **stack**. Push opening brackets. For each closing bracket, the top of the stack must be its matching opener. At the end, the stack must be empty.

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
```

**Complexity:** O(n) time, O(n) space.

**Frontend link:** the same idea validates HTML tag nesting.

---

**Q5. Best Time to Buy and Sell a Stock**

**Problem:** Given daily prices, find the maximum profit from one buy followed by one sell.

**Idea:** Track the lowest price so far. At each day, the best possible profit is today's price minus that minimum.

```js
function maxProfit(prices) {
  let min = Infinity, best = 0;
  for (const p of prices) {
    min = Math.min(min, p);
    best = Math.max(best, p - min);
  }
  return best;
}
maxProfit([7, 1, 5, 3, 6, 4]); // 5 (buy at 1, sell at 6)
```

**Complexity:** O(n) time, O(1) space.

---

**Q6. Maximum Subarray (Kadane's Algorithm)**

**Problem:** Find the contiguous subarray with the largest sum.

**Idea:** At each element, either extend the previous subarray or start fresh from this element, whichever is larger. If the running sum goes negative, it can only hurt what comes next.

```js
function maxSubArray(nums) {
  let cur = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    best = Math.max(best, cur);
  }
  return best;
}
maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]); // 6  ([4, -1, 2, 1])
```

**Complexity:** O(n) time, O(1) space.

---

**Q7. Contains Duplicate**

```js
const containsDuplicate = (nums) => new Set(nums).size !== nums.length;
```

**Idea:** A Set drops duplicates, so if its size is smaller than the array's length, there was a duplicate. O(n) time and space.

---

**Q8. Reverse a Linked List**

**Idea:** Walk the list and flip each `next` pointer to point backwards. You need three variables: `prev`, `current` and `next`.

```js
function reverseList(head) {
  let prev = null;
  while (head) {
    const next = head.next;  // save
    head.next = prev;        // flip
    prev = head;             // advance prev
    head = next;             // advance head
  }
  return prev;
}
```

**Complexity:** O(n) time, O(1) space.

**Dry run:** For `1 → 2 → 3`, flipping each pointer gives `null ← 1 ← 2 ← 3`, so the new head is 3.

---

**Q9. Merge Two Sorted Lists**

**Idea:** Use a dummy head node. Repeatedly attach the smaller of the two current nodes, then attach whatever is left over.

```js
function mergeTwoLists(a, b) {
  const dummy = { next: null };
  let tail = dummy;
  while (a && b) {
    if (a.val <= b.val) { tail.next = a; a = a.next; }
    else { tail.next = b; b = b.next; }
    tail = tail.next;
  }
  tail.next = a ?? b;
  return dummy.next;
}
```

**Complexity:** O(n + m) time, O(1) space.

---

**Q10. Linked List Cycle (Floyd's Tortoise and Hare)**

**Idea:** A slow pointer moves 1 step and a fast pointer moves 2. If there's a cycle, the fast one eventually laps the slow one and they meet. If fast reaches the end, there's no cycle.

```js
function hasCycle(head) {
  let slow = head, fast = head;
  while (fast?.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}
```

**Complexity:** O(n) time, O(1) space. A Set of visited nodes would be O(n) space.

---

**Q11. Binary Search**

**Idea:** In a sorted array, compare with the middle element and discard the half that can't contain the target. Each step halves the search space.

```js
function search(a, target) {
  let l = 0, r = a.length - 1;
  while (l <= r) {
    const m = (l + r) >> 1;            // integer middle
    if (a[m] === target) return m;
    if (a[m] < target) l = m + 1; else r = m - 1;
  }
  return -1;
}
```

**Complexity:** O(log n) time, O(1) space.

---

**Q12. Maximum Depth of a Binary Tree**

```js
const maxDepth = (node) => (node ? 1 + Math.max(maxDepth(node.left), maxDepth(node.right)) : 0);
```

**Idea:** A tree's depth is 1 plus the deeper of its subtrees. An empty tree has depth 0. O(n) time, O(h) space for the recursion, where h is the tree's height.

---

**Q13. Invert a Binary Tree**

```js
function invert(node) {
  if (!node) return node;
  [node.left, node.right] = [invert(node.right), invert(node.left)];
  return node;
}
```

**Idea:** Swap the left and right children at every node, recursively. O(n).

---

**Q14. Climbing Stairs**

**Problem:** You can climb 1 or 2 steps at a time. How many distinct ways are there to reach step n?

**Idea:** To reach step n, your last move came from step n−1 or step n−2. So `ways(n) = ways(n−1) + ways(n−2)`, which is the Fibonacci sequence. Only the last two values are needed.

```js
function climbStairs(n) {
  let a = 1, b = 1;                 // ways(0), ways(1)
  for (let i = 2; i <= n; i++) [a, b] = [b, a + b];
  return b;
}
```

**Complexity:** O(n) time, O(1) space. This is the simplest DP problem, so explain the recurrence clearly.

---

**Q15. First Unique Character**

```js
function firstUniqChar(s) {
  const count = new Map();
  for (const ch of s) count.set(ch, (count.get(ch) ?? 0) + 1);
  for (let i = 0; i < s.length; i++) if (count.get(s[i]) === 1) return i;
  return -1;
}
```

**Idea:** Two passes: count every character, then return the index of the first one with a count of 1. O(n).

---

**Q16. Move Zeroes (In Place)**

```js
function moveZeroes(a) {
  let write = 0;
  for (let read = 0; read < a.length; read++) {
    if (a[read] !== 0) {
      [a[write], a[read]] = [a[read], a[write]];
      write++;
    }
  }
  return a;
}
moveZeroes([0, 1, 0, 3, 12]); // [1, 3, 12, 0, 0]
```

**Idea:** Two pointers. `read` scans the array, and `write` marks where the next non-zero element belongs. O(n) time, O(1) space.

---

## 🟡 Medium

**Q17. Longest Substring Without Repeating Characters**

**Problem:** For `"abcabcbb"` the answer is 3 (`"abc"`).

**Idea:** A **sliding window**. Expand `r`. If `s[r]` already appeared inside the window, jump `l` past its previous position. Track the best window length.

```js
function lengthOfLongestSubstring(s) {
  const last = new Map();   // char → last index seen
  let l = 0, best = 0;
  for (let r = 0; r < s.length; r++) {
    if (last.has(s[r]) && last.get(s[r]) >= l) l = last.get(s[r]) + 1;
    last.set(s[r], r);
    best = Math.max(best, r - l + 1);
  }
  return best;
}
```

**Complexity:** O(n) time, O(k) space.

**Say it like this:** "The window always holds unique characters. When I see a repeat inside the window, I move the left edge just past its previous occurrence. Each character is processed once, so it's linear."

---

**Q18. Group Anagrams**

```js
function groupAnagrams(strs) {
  const groups = new Map();
  for (const s of strs) {
    const key = [...s].sort().join('');      // "eat" → "aet"
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
  }
  return [...groups.values()];
}
groupAnagrams(['eat', 'tea', 'tan', 'ate', 'nat', 'bat']);
// [['eat','tea','ate'], ['tan','nat'], ['bat']]
```

**Idea:** Anagrams share the same sorted letters, so use that as the map key. O(n · k log k) time, where k is the word length.

---

**Q19. Top K Frequent Elements**

**Idea:** Count frequencies, then use **bucket sort**: `buckets[count]` holds the numbers with that count. Walk the buckets from the highest count down until you have k numbers. This avoids an O(n log n) sort.

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

**Complexity:** O(n) time, O(n) space.

---

**Q20. Product of Array Except Self (Without Division)**

**Idea:** Each answer is (the product of everything to the left) × (the product of everything to the right). Compute the left products in one pass and multiply in the right products in a second pass.

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

**Complexity:** O(n) time, O(1) extra space (not counting the output).

---

**Q21. 3Sum**

**Problem:** Find all unique triplets that sum to 0.

**Idea:** Sort the array. Fix one number, then find pairs in the rest with **two pointers**. Skip duplicate values to avoid repeated triplets.

```js
function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const res = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i && nums[i] === nums[i - 1]) continue;          // skip duplicate anchors
    let l = i + 1, r = nums.length - 1;
    while (l < r) {
      const sum = nums[i] + nums[l] + nums[r];
      if (sum === 0) {
        res.push([nums[i], nums[l], nums[r]]);
        while (nums[l] === nums[l + 1]) l++;
        while (nums[r] === nums[r - 1]) r--;
        l++; r--;
      } else if (sum < 0) l++; else r--;
    }
  }
  return res;
}
```

**Complexity:** O(n²) time, plus O(log n) to O(n) space for sorting.

---

**Q22. Container With Most Water**

**Idea:** Two pointers at the two ends. The area is limited by the *shorter* line, so move the shorter one inwards. Moving the taller one can never help.

```js
function maxArea(h) {
  let l = 0, r = h.length - 1, best = 0;
  while (l < r) {
    best = Math.max(best, Math.min(h[l], h[r]) * (r - l));
    if (h[l] < h[r]) l++; else r--;
  }
  return best;
}
```

**Complexity:** O(n) time, O(1) space.

---

**Q23. Subarray Sum Equals K**

**Idea:** With **prefix sums**, a subarray `(j, i]` sums to k when `prefix[i] − prefix[j] = k`, which means `prefix[j] = prefix[i] − k`. Count how many times each prefix sum has appeared in a map.

```js
function subarraySum(nums, k) {
  const seen = new Map([[0, 1]]);   // empty prefix
  let sum = 0, count = 0;
  for (const n of nums) {
    sum += n;
    count += seen.get(sum - k) ?? 0;
    seen.set(sum, (seen.get(sum) ?? 0) + 1);
  }
  return count;
}
```

**Complexity:** O(n) time, O(n) space. It works with negative numbers, where a sliding window wouldn't.

---

**Q24. Merge Intervals**

**Idea:** Sort by start time. If the next interval starts before the current one ends, they overlap, so extend the current end. Otherwise, start a new interval.

```js
function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const out = [];
  for (const [start, end] of intervals) {
    const last = out.at(-1);
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else out.push([start, end]);
  }
  return out;
}
merge([[1, 3], [2, 6], [8, 10], [15, 18]]); // [[1,6],[8,10],[15,18]]
```

**Complexity:** O(n log n) because of the sort.

**Frontend link:** merging highlighted transcript segments, or calendar busy blocks.

---

**Q25. Meeting Rooms II (Minimum Rooms)**

**Idea:** A **sweep line**. Sort the start times and end times separately. Walk the starts: if a meeting starts before the earliest unfinished meeting ends, you need a new room. Otherwise a room frees up.

```js
function minMeetingRooms(intervals) {
  const starts = intervals.map((i) => i[0]).sort((a, b) => a - b);
  const ends = intervals.map((i) => i[1]).sort((a, b) => a - b);
  let rooms = 0, e = 0;
  for (const s of starts) {
    if (s < ends[e]) rooms++;
    else e++;
  }
  return rooms;
}
```

**Complexity:** O(n log n).

---

**Q26. Daily Temperatures**

**Problem:** For each day, how many days until a warmer temperature?

**Idea:** A **monotonic stack** of indexes with decreasing temperatures. When a warmer day arrives, pop every colder day from the stack and record the gap for each.

```js
function dailyTemperatures(t) {
  const res = Array(t.length).fill(0);
  const stack = [];                         // indexes, temps decreasing
  for (let i = 0; i < t.length; i++) {
    while (stack.length && t[i] > t[stack.at(-1)]) {
      const j = stack.pop();
      res[j] = i - j;
    }
    stack.push(i);
  }
  return res;
}
```

**Complexity:** O(n) time, because each index is pushed and popped once.

---

**Q27. Min Stack (getMin in O(1))**

```js
class MinStack {
  stack = [];
  mins = [];                // mins[i] = min of stack[0..i]
  push(x) { this.stack.push(x); this.mins.push(Math.min(x, this.mins.at(-1) ?? Infinity)); }
  pop() { this.stack.pop(); this.mins.pop(); }
  top() { return this.stack.at(-1); }
  getMin() { return this.mins.at(-1); }
}
```

**Idea:** Keep a parallel stack that records the minimum at each depth.

---

**Q28. Search in a Rotated Sorted Array**

**Problem:** `[4,5,6,7,0,1,2]` is a sorted array rotated at some point. Find the target in O(log n).

**Idea:** In binary search, at least one half is always sorted. Check whether the target lies inside the sorted half's range. If it does, search there; otherwise search the other half.

```js
function searchRotated(a, target) {
  let l = 0, r = a.length - 1;
  while (l <= r) {
    const m = (l + r) >> 1;
    if (a[m] === target) return m;
    if (a[l] <= a[m]) {                                   // left half sorted
      if (a[l] <= target && target < a[m]) r = m - 1; else l = m + 1;
    } else {                                              // right half sorted
      if (a[m] < target && target <= a[r]) l = m + 1; else r = m - 1;
    }
  }
  return -1;
}
```

---

**Q29. Koko Eating Bananas (Binary Search on the Answer)**

**Problem:** Find the minimum eating speed k that finishes all the piles within h hours.

**Idea:** If speed k works, every faster speed works too. That's a *monotonic* condition, so binary-search the speed between 1 and the largest pile.

```js
function minEatingSpeed(piles, h) {
  let l = 1, r = Math.max(...piles);
  while (l < r) {
    const k = (l + r) >> 1;
    const hours = piles.reduce((sum, p) => sum + Math.ceil(p / k), 0);
    if (hours <= h) r = k; else l = k + 1;
  }
  return l;
}
```

**Complexity:** O(n log max) time.

**Say it like this:** "I'm not searching the array. I'm searching the answer space. When the answer has a yes/no condition that flips once, binary search applies."

---

**Q30. Binary Tree Level-Order Traversal (BFS)**

```js
function levelOrder(root) {
  if (!root) return [];
  const result = [];
  let level = [root];
  while (level.length) {
    result.push(level.map((n) => n.val));
    level = level.flatMap((n) => [n.left, n.right].filter(Boolean));
  }
  return result;
}
```

**Idea:** Process the tree one level at a time. Building the next level as a new array avoids `shift()`, which is O(n). O(n) time.

---

**Q31. Validate a Binary Search Tree**

```js
function isValidBST(node, lo = -Infinity, hi = Infinity) {
  if (!node) return true;
  if (node.val <= lo || node.val >= hi) return false;
  return isValidBST(node.left, lo, node.val) && isValidBST(node.right, node.val, hi);
}
```

**Idea:** Every node must lie inside a (low, high) range inherited from its ancestors. Checking only the parent and child isn't enough, which is a common mistake.

---

**Q32. Lowest Common Ancestor (Binary Tree)**

```js
function lca(root, p, q) {
  if (!root || root === p || root === q) return root;
  const left = lca(root.left, p, q);
  const right = lca(root.right, p, q);
  return left && right ? root : left ?? right;
}
```

**Idea:** If p and q are found in different subtrees, the current node is their LCA. Otherwise, pass up whichever side found something. O(n).

---

**Q33. Number of Islands (DFS)**

```js
function numIslands(grid) {
  let count = 0;
  const sink = (r, c) => {
    if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] !== '1') return;
    grid[r][c] = '0';                       // mark visited
    sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1);
  };
  for (let r = 0; r < grid.length; r++)
    for (let c = 0; c < grid[0].length; c++)
      if (grid[r][c] === '1') { count++; sink(r, c); }
  return count;
}
```

**Idea:** Each time you find unvisited land, count an island and "sink" all of its connected land with DFS. O(rows × cols).

---

**Q34. Rotting Oranges (Multi-Source BFS)**

```js
function orangesRotting(grid) {
  let queue = [], fresh = 0, minutes = 0;
  grid.forEach((row, r) => row.forEach((v, c) => {
    if (v === 2) queue.push([r, c]);
    if (v === 1) fresh++;
  }));
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (queue.length && fresh) {
    const next = [];
    for (const [r, c] of queue) {
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (grid[nr]?.[nc] === 1) { grid[nr][nc] = 2; fresh--; next.push([nr, nc]); }
      }
    }
    queue = next;
    minutes++;
  }
  return fresh ? -1 : minutes;
}
```

**Idea:** Start BFS from *all* the rotten oranges at once. Each BFS level is one minute.

---

**Q35. Course Schedule (Topological Sort, Kahn's Algorithm)**

**Problem:** Can you finish all courses given prerequisite pairs? In other words, is there a cycle?

**Idea:** Count each node's incoming edges (in-degree). Repeatedly take nodes with in-degree 0, and decrement the in-degree of their neighbours. If you can process every node, there's no cycle.

```js
function canFinish(n, prereqs) {
  const indeg = Array(n).fill(0);
  const adj = Array.from({ length: n }, () => []);
  for (const [course, pre] of prereqs) { adj[pre].push(course); indeg[course]++; }
  const queue = [];
  indeg.forEach((d, i) => d === 0 && queue.push(i));
  let done = 0;
  for (let i = 0; i < queue.length; i++) {
    done++;
    for (const next of adj[queue[i]]) if (--indeg[next] === 0) queue.push(next);
  }
  return done === n;
}
```

**Frontend link:** module bundlers, build pipelines and spreadsheet formula recalculation all use topological ordering.

---

**Q36. Permutations (Backtracking)**

**Idea:** Build the permutation one position at a time. At each step, try every unused number, recurse, then **undo** the choice. Undoing is the "backtrack".

```js
function permute(nums) {
  const result = [], path = [], used = Array(nums.length).fill(false);
  (function backtrack() {
    if (path.length === nums.length) return result.push([...path]);
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true; path.push(nums[i]);   // choose
      backtrack();                          // explore
      path.pop(); used[i] = false;          // un-choose
    }
  })();
  return result;
}
```

**Complexity:** O(n · n!).

---

**Q37. Subsets**

```js
const subsets = (nums) => nums.reduce((acc, n) => acc.concat(acc.map((s) => [...s, n])), [[]]);
subsets([1, 2, 3]); // [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]
```

**Idea:** Start with the empty set. Each new number doubles the list: every existing subset, with and without that number. O(n · 2ⁿ).

---

**Q38. Coin Change (Dynamic Programming)**

**Problem:** What's the fewest coins that make up `amount`? Return -1 if it's impossible.

**Idea:** `dp[a]` is the fewest coins needed for amount `a`. For each coin, `dp[a] = min(dp[a], dp[a − coin] + 1)`. Build it up from 0.

```js
function coinChange(coins, amount) {
  const dp = Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}
coinChange([1, 2, 5], 11); // 3  (5 + 5 + 1)
```

**Complexity:** O(amount × coins) time, O(amount) space.

**Say it like this:** "Greedy fails here. With coins [1, 3, 4] and amount 6, greedy picks 4 + 1 + 1, which is three coins, but 3 + 3 is only two. So I use DP: the best answer for each smaller amount builds the answer for the next."

---

**Q39. House Robber**

```js
function rob(nums) {
  let prev = 0, cur = 0;            // best up to i-2, best up to i-1
  for (const n of nums) [prev, cur] = [cur, Math.max(cur, prev + n)];
  return cur;
}
```

**Idea:** For each house, either skip it (keep `cur`) or rob it (`prev + n`), because you can't rob two adjacent houses. O(n) time, O(1) space.

---

**Q40. Longest Increasing Subsequence (O(n log n))**

**Idea:** `tails[i]` holds the smallest possible tail value of an increasing subsequence of length `i + 1`. For each number, binary-search where it fits in `tails` and replace that slot. The length of `tails` is the answer.

```js
function lengthOfLIS(nums) {
  const tails = [];
  for (const x of nums) {
    let l = 0, r = tails.length;
    while (l < r) {
      const m = (l + r) >> 1;
      if (tails[m] < x) l = m + 1; else r = m;
    }
    tails[l] = x;
  }
  return tails.length;
}
```

---

**Q41. Word Break**

```js
function wordBreak(s, dict) {
  const words = new Set(dict);
  const dp = Array(s.length + 1).fill(false);
  dp[0] = true;                          // empty prefix is breakable
  for (let i = 1; i <= s.length; i++) {
    for (let j = 0; j < i; j++) {
      if (dp[j] && words.has(s.slice(j, i))) { dp[i] = true; break; }
    }
  }
  return dp[s.length];
}
wordBreak('leetcode', ['leet', 'code']); // true
```

**Idea:** `dp[i]` is true if `s[0..i)` can be split into dictionary words. O(n²) checks.

---

**Q42. Kth Largest Element (Quickselect)**

**Idea:** Partition the array the way quicksort does, but recurse into only the side that contains the target index. That's O(n) on average. Alternatively, keep a min-heap of size k, which is O(n log k).

```js
function findKthLargest(nums, k) {
  const target = nums.length - k;
  let l = 0, r = nums.length - 1;
  while (true) {
    const pivot = nums[r];
    let p = l;
    for (let i = l; i < r; i++) {
      if (nums[i] <= pivot) { [nums[i], nums[p]] = [nums[p], nums[i]]; p++; }
    }
    [nums[p], nums[r]] = [nums[r], nums[p]];
    if (p === target) return nums[p];
    if (p < target) l = p + 1; else r = p - 1;
  }
}
```

---

**Q43. LRU Cache**

**Problem:** A cache with a capacity. When it's full, evict the **least recently used** entry. Both `get` and `put` must be O(1).

**Idea:** A JavaScript `Map` remembers insertion order. To mark a key as "recently used", delete it and re-insert it, which moves it to the end. The first key in the map is then always the least recently used.

```js
class LRUCache {
  constructor(capacity) { this.capacity = capacity; this.map = new Map(); }
  get(key) {
    if (!this.map.has(key)) return -1;
    const value = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, value);              // move to most-recent
    return value;
  }
  put(key, value) {
    this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity) this.map.delete(this.map.keys().next().value); // evict oldest
  }
}
```

**Say it like this:** "In other languages you'd build a hash map plus a doubly linked list. In JavaScript, Map's insertion order gives us the same O(1) behaviour. I can implement the linked-list version if you'd like."

**Frontend link:** caching API responses, images or computed results with a memory limit.

---

**Q44. Implement a Trie (for Autocomplete)**

```js
class Trie {
  root = { children: new Map(), end: false };

  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, { children: new Map(), end: false });
      node = node.children.get(ch);
    }
    node.end = true;
  }

  suggest(prefix, limit = 5) {
    let node = this.root;
    for (const ch of prefix) {
      node = node.children.get(ch);
      if (!node) return [];
    }
    const out = [];
    (function dfs(n, acc) {
      if (out.length >= limit) return;
      if (n.end) out.push(acc);
      for (const [ch, child] of n.children) dfs(child, acc + ch);
    })(node, prefix);
    return out;
  }
}
```

**Idea:** Each node is a character, and a path from the root spells a word. Finding all words with a prefix means walking down to the prefix node and collecting everything below it. The cost depends on the prefix length, not on the number of words.

---

## 🔴 Hard (Senior and Product Companies)

**Q45. Minimum Window Substring**

**Problem:** Find the smallest substring of `s` that contains every character of `t`, including duplicates.

**Idea:** A sliding window. Expand `r` until the window contains everything (`missing === 0`), then shrink `l` as far as possible while it stays valid, recording the best window.

```js
function minWindow(s, t) {
  const need = new Map();
  for (const c of t) need.set(c, (need.get(c) ?? 0) + 1);
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

**Complexity:** O(|s| + |t|).

---

**Q46. Sliding Window Maximum (Monotonic Deque)**

**Idea:** Keep a deque of indexes whose values are in decreasing order, so the front is always the maximum of the current window. Drop smaller values from the back as new values arrive, and drop the front when it falls out of the window.

```js
function maxSlidingWindow(nums, k) {
  const dq = [], res = [];
  let head = 0;                                   // index pointer instead of shift()
  for (let i = 0; i < nums.length; i++) {
    while (dq.length > head && nums[dq.at(-1)] <= nums[i]) dq.pop();
    dq.push(i);
    if (dq[head] <= i - k) head++;                // front left the window
    if (i >= k - 1) res.push(nums[dq[head]]);
  }
  return res;
}
```

**Complexity:** O(n).

---

**Q47. Merge K Sorted Lists**

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

**Idea:** Merge the lists in pairs, like a tournament. Each round halves the number of lists, so the total cost is O(N log k), where N is the total number of nodes. Reuse `mergeTwoLists` from Q9.

---

**Q48. Trapping Rain Water**

**Idea:** The water above a bar is `min(highest bar to the left, highest bar to the right) − its height`. Use two pointers: always move the side with the lower maximum, because that side's water level is already settled.

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

**Complexity:** O(n) time, O(1) space.

---

**Q49. Serialise and Deserialise a Binary Tree**

```js
const serialize = (root) => {
  const out = [];
  (function walk(n) {
    if (!n) return out.push('#');
    out.push(n.val); walk(n.left); walk(n.right);
  })(root);
  return out.join(',');
};

const deserialize = (data) => {
  const vals = data.split(',');
  let i = 0;
  return (function build() {
    const v = vals[i++];
    if (v === '#') return null;
    return { val: +v, left: build(), right: build() };
  })();
};
```

**Idea:** A pre-order traversal with `#` markers for nulls captures the exact shape of the tree. Rebuilding it reads the values in the same order. O(n).

---

**Q50. Edit Distance (Used in Diffing and Fuzzy Search)**

**Problem:** Find the minimum number of inserts, deletes and replacements needed to turn string a into string b.

**Idea:** `dp[i][j]` is the edit distance between the first i characters of a and the first j characters of b. If the characters match, take the diagonal. Otherwise take 1 + the minimum of replace, delete and insert.

```js
function minDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}
minDistance('horse', 'ros'); // 3
```

**Complexity:** O(m·n).

---

**Q51. Median from a Data Stream**

**Idea:** Use two heaps: a max-heap for the lower half of the numbers and a min-heap for the upper half, kept balanced so their sizes differ by at most 1. The median is the top of the larger heap, or the average of the two tops. Adding a number is O(log n), and finding the median is O(1).

**Say it like this:** "JavaScript has no built-in heap. I can write a small binary heap class: an array plus sift-up and sift-down. Or, if you're happy with it, I'll treat the heap as a helper and focus on the two-heap logic."

---

## 🌐 Frontend-Flavoured DSA (Very Common in UI Interviews)

**Q52. Flatten a nested object to dot paths**

```js
function flattenObject(obj, prefix = '', out = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) flattenObject(value, path, out);
    else out[path] = value;
  }
  return out;
}
flattenObject({ user: { name: 'Asha', address: { city: 'Pune' } } });
// { 'user.name': 'Asha', 'user.address.city': 'Pune' }
```

**Use case:** form libraries, translation keys, and diffing settings objects.

---

**Q53. Unflatten dot paths back into a nested object**

```js
function unflatten(flat) {
  const out = {};
  for (const [path, value] of Object.entries(flat)) {
    const keys = path.split('.');
    let cur = out;
    keys.forEach((k, i) => { cur = cur[k] ??= i === keys.length - 1 ? value : {}; });
  }
  return out;
}
```

---

**Q54. Convert a flat list with `parentId` into a tree (comments, org chart, file explorer)**

```js
function toTree(items) {
  const map = new Map(items.map((i) => [i.id, { ...i, children: [] }]));
  const roots = [];
  for (const node of map.values()) {
    const parent = node.parentId != null ? map.get(node.parentId) : null;
    (parent ? parent.children : roots).push(node);
  }
  return roots;
}

toTree([
  { id: 1, parentId: null, text: 'Root comment' },
  { id: 2, parentId: 1, text: 'Reply' },
]);
```

**Idea:** Two passes with a Map make this O(n). A naive version that searches for each node's parent in a nested loop is O(n²).

**Say it like this:** "First I index every node by ID, then a single pass attaches each node to its parent. It's linear and handles any depth. APIs often return threaded comments flat like this."

---

**Q55. Find all DOM nodes matching a predicate**

```js
function findAll(root, predicate) {
  const out = [], stack = [root];
  while (stack.length) {
    const node = stack.pop();
    if (predicate(node)) out.push(node);
    for (let i = node.children.length - 1; i >= 0; i--) stack.push(node.children[i]); // keep document order
  }
  return out;
}
findAll(document.body, (el) => el.tagName === 'BUTTON' && !el.hasAttribute('aria-label'));
```

**Idea:** An iterative DFS avoids recursion limits on very deep DOM trees.

---

**Q56. Find the corresponding node in an identical DOM tree**

```js
function findMirror(rootA, rootB, nodeA) {
  const path = [];
  for (let n = nodeA; n !== rootA; n = n.parentElement) {
    path.push([...n.parentElement.children].indexOf(n));   // index among siblings
  }
  return path.reverse().reduce((n, i) => n.children[i], rootB);
}
```

**Idea:** Record the path of child indexes from the node up to the root, then replay that path down the other tree. O(depth × siblings).

---

**Q57. Lowest common ancestor of two DOM nodes**

```js
function domLCA(a, b) {
  const ancestors = new Set();
  for (let n = a; n; n = n.parentElement) ancestors.add(n);
  for (let n = b; n; n = n.parentElement) if (ancestors.has(n)) return n;
  return null;
}
```

**Idea:** DOM nodes have parent pointers, so collect all of a's ancestors, then walk up from b until you hit one.

---

**Q58. Highlight search matches in text (return segments, no `innerHTML`)**

```js
function highlight(text, query) {
  if (!query) return [{ text, match: false }];
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');      // escape regex chars
  return text
    .split(new RegExp(`(${escaped})`, 'gi'))
    .filter(Boolean)
    .map((part) => ({ text: part, match: part.toLowerCase() === query.toLowerCase() }));
}

// React usage — safe, no innerHTML:
{highlight(transcript, q).map((s, i) => (s.match ? <mark key={i}>{s.text}</mark> : <span key={i}>{s.text}</span>))}
```

**Say it like this:** "I return segments rather than an HTML string, so React escapes everything and there's no XSS risk. I also escape the query, so a user typing `(` doesn't break the regex."

---

**Q59. Pagination window with ellipsis: `1 … 4 5 [6] 7 8 … 20`**

```js
function pageWindow(current, total, radius = 2) {
  const pages = new Set([1, total]);
  for (let p = current - radius; p <= current + radius; p++) if (p > 1 && p < total) pages.add(p);
  const sorted = [...pages].sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i && p - sorted[i - 1] > 1) out.push('…');
    out.push(p);
  });
  return out;
}
pageWindow(6, 20); // [1, '…', 4, 5, 6, 7, 8, '…', 20]
```

---

**Q60. Concurrency-limited promise pool**

```js
async function pool(tasks, limit) {
  const results = [];
  let next = 0;
  const worker = async () => {
    while (next < tasks.length) {
      const i = next++;
      results[i] = await tasks[i]();
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}
```

**Idea:** Start N workers. Each one pulls the next task from a shared index until none are left (see also JavaScript Q120).

---

**Q61. Group calls by agent and compute average scores**

```js
function averageScoreByAgent(calls) {
  const acc = new Map();
  for (const { agent, score } of calls) {
    if (score == null) continue;                 // skip unscored calls
    const a = acc.get(agent) ?? { sum: 0, n: 0 };
    a.sum += score; a.n++;
    acc.set(agent, a);
  }
  return [...acc]
    .map(([agent, { sum, n }]) => ({ agent, avg: +(sum / n).toFixed(1) }))
    .sort((a, b) => b.avg - a.avg);
}
```

**Say it like this:** "One pass with a Map to accumulate the sum and count per agent, then a sort for ranking. I skip null scores explicitly, so unscored calls don't drag the averages down."

---

**Q62. Find the active transcript line for a playback time (binary search)**

```js
function activeLine(lines, t) {           // lines sorted by start time
  let lo = 0, hi = lines.length - 1, ans = -1;
  while (lo <= hi) {
    const m = (lo + hi) >> 1;
    if (lines[m].start <= t) { ans = m; lo = m + 1; } else hi = m - 1;
  }
  return ans;                             // last line that started before t
}
```

**Idea:** The audio's `timeupdate` event fires about 4 times a second, and a transcript can have thousands of lines. Binary search makes each lookup O(log n) instead of O(n).

---

**Q63. Merge overlapping time ranges of flagged compliance segments**

**Answer:** It's the same as Merge Intervals (Q24). Sort by start time and merge overlaps. Then the transcript highlights clean, non-overlapping ranges.

---

**Q64. Detect circular dependencies in module imports**

**Answer:** Use DFS with three colours: white (unvisited), grey (on the current path) and black (finished). Reaching a grey node means there's a cycle. Kahn's algorithm (Q35) also works.

```js
function hasCycle(graph) {          // graph: Map<module, module[]>
  const state = new Map();          // undefined=white, 1=grey, 2=black
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

---

**Q65. Implement a subset of `JSON.stringify` (recursion practice)**

```js
function stringify(v) {
  if (v === null || typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (typeof v === 'string') return `"${v.replace(/["\\]/g, '\\$&')}"`;
  if (Array.isArray(v)) {
    return `[${v.map((x) => (x === undefined || typeof x === 'function' ? 'null' : stringify(x))).join(',')}]`;
  }
  if (typeof v === 'object') {
    return `{${Object.entries(v)
      .filter(([, x]) => x !== undefined && typeof x !== 'function')
      .map(([k, x]) => `"${k}":${stringify(x)}`)
      .join(',')}}`;
  }
}
```

**Points to mention:** `undefined` and functions are skipped in objects but become `null` in arrays, strings need escaping, and a real implementation also handles cycles, `toJSON` and `Infinity`/`NaN` (which become `null`).

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

**Study tip:** For each problem, write down the *pattern* name and a one-line idea. In the interview, recognising the pattern quickly is worth more than remembering the code.
