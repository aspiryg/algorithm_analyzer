/*
  Merge Sort -- step-by-step recording engine.

  This engine records the full divide-and-conquer process:
    - Splitting the array into halves
    - Recursively sorting each half
    - Merging two sorted halves back together

  We capture enough data to draw:
    1. The bar chart (full array state with highlighted ranges)
    2. A recursion tree showing the call hierarchy
    3. The merge operation showing left/right sub-arrays combining

  Step shape:
    {
      type:            'init' | 'split' | 'compare' | 'merge-pick' | 'merge-complete'
                       | 'copy-remaining' | 'done'
      array:           number[]            – full array state
      activeRange:     [left, right]       – currently active sub-array range (inclusive)
      leftRange:       [l, m] | null       – left half during merge
      rightRange:      [m+1, r] | null     – right half during merge
      highlightIndices:number[]            – indices currently being compared or moved
      mergedIndices:   number[]            – indices that have been placed during this merge
      markedSorted:    number[]            – indices confirmed as globally sorted
      depth:           number              – recursion depth (0 = top level)
      recursionTree:   TreeNode[]          – current state of the call tree
      callStack:       StackFrame[]        – current call stack
      description:     string
    }

  TreeNode shape:
    { range: [l, r], state: 'pending' | 'splitting' | 'merging' | 'sorted', children: TreeNode[] }

  StackFrame shape:
    { label: string, range: [l, r] }
*/

export function runMergeSort(arr) {
  const a = [...arr];
  const n = a.length;
  const steps = [];

  // Track element identities for horizontal swap animation
  const ids = Array.from({ length: n }, (_, i) => i);

  // Build the full recursion tree upfront (with 'pending' state)
  // and mutate its node states as we go so each step snapshot has the tree.
  // We always clone from `rootTree` for snapshots — mutations propagate through
  // children because JS objects are by reference.
  const rootTree = buildTree(0, n - 1);
  const callStack = [];

  steps.push({
    type: 'init',
    array: [...a],
    elementIds: [...ids],
    activeRange: [0, n - 1],
    leftRange: null,
    rightRange: null,
    highlightIndices: [],
    mergedIndices: [],
    markedSorted: [],
    depth: 0,
    recursionTree: cloneTree(rootTree),
    callStack: [],
    description: `Starting Merge Sort on ${n} elements. We will recursively split, sort, and merge.`,
  });

  mergeSortHelper(a, ids, 0, n - 1, 0, rootTree, rootTree, callStack, steps);

  steps.push({
    type: 'done',
    array: [...a],
    elementIds: [...ids],
    activeRange: [0, n - 1],
    leftRange: null,
    rightRange: null,
    highlightIndices: [],
    mergedIndices: [],
    markedSorted: Array.from({ length: n }, (_, i) => i),
    depth: 0,
    recursionTree: cloneTree(rootTree),
    callStack: [],
    description: `Merge Sort complete! The array is now fully sorted.`,
  });

  return steps;
}

// ---- recursive implementation that records steps ----

function mergeSortHelper(a, ids, left, right, depth, treeNode, rootTree, callStack, steps) {
  if (left >= right) {
    // base case: single element is already sorted
    treeNode.state = 'sorted';
    return;
  }

  const mid = Math.floor((left + right) / 2);

  // record split
  treeNode.state = 'splitting';
  callStack.push({ label: `sort(${left}..${right})`, range: [left, right] });

  steps.push({
    type: 'split',
    array: [...a],
    elementIds: [...ids],
    activeRange: [left, right],
    leftRange: [left, mid],
    rightRange: [mid + 1, right],
    highlightIndices: rangeToIndices(left, right),
    mergedIndices: [],
    markedSorted: [],
    depth,
    recursionTree: cloneTree(rootTree),
    callStack: [...callStack],
    description: `Split [${left}..${right}] into left [${left}..${mid}] and right [${mid + 1}..${right}].`,
  });

  // recurse left
  mergeSortHelper(a, ids, left, mid, depth + 1, treeNode.children[0], rootTree, callStack, steps);

  // recurse right
  mergeSortHelper(a, ids, mid + 1, right, depth + 1, treeNode.children[1], rootTree, callStack, steps);

  // merge the two sorted halves
  merge(a, ids, left, mid, right, depth, treeNode, rootTree, callStack, steps);

  callStack.pop();
}

function merge(a, ids, left, mid, right, depth, treeNode, rootTree, callStack, steps) {
  treeNode.state = 'merging';

  const leftCopy = a.slice(left, mid + 1);
  const rightCopy = a.slice(mid + 1, right + 1);
  const leftIds = ids.slice(left, mid + 1);
  const rightIds = ids.slice(mid + 1, right + 1);
  const mergedIndices = [];

  let i = 0;           // index into leftCopy
  let j = 0;           // index into rightCopy
  let k = left;        // index into main array

  while (i < leftCopy.length && j < rightCopy.length) {
    // compare step
    steps.push({
      type: 'compare',
      array: [...a],
      elementIds: [...ids],
      activeRange: [left, right],
      leftRange: [left, mid],
      rightRange: [mid + 1, right],
      highlightIndices: [left + i, mid + 1 + j],
      mergedIndices: [...mergedIndices],
      markedSorted: [],
      depth,
      recursionTree: cloneTree(rootTree),
      callStack: [...callStack],
      description: `Compare left[${i}]=${leftCopy[i]} with right[${j}]=${rightCopy[j]}. ${leftCopy[i] <= rightCopy[j] ? `${leftCopy[i]} ≤ ${rightCopy[j]}, pick from left.` : `${rightCopy[j]} < ${leftCopy[i]}, pick from right.`}`,
    });

    if (leftCopy[i] <= rightCopy[j]) {
      a[k] = leftCopy[i];
      ids[k] = leftIds[i];
      mergedIndices.push(k);
      i++;
    } else {
      a[k] = rightCopy[j];
      ids[k] = rightIds[j];
      mergedIndices.push(k);
      j++;
    }

    steps.push({
      type: 'merge-pick',
      array: [...a],
      elementIds: [...ids],
      activeRange: [left, right],
      leftRange: [left, mid],
      rightRange: [mid + 1, right],
      highlightIndices: [k],
      mergedIndices: [...mergedIndices],
      markedSorted: [],
      depth,
      recursionTree: cloneTree(rootTree),
      callStack: [...callStack],
      description: `Placed ${a[k]} at index ${k}.`,
    });

    k++;
  }

  // copy remaining left elements
  while (i < leftCopy.length) {
    a[k] = leftCopy[i];
    ids[k] = leftIds[i];
    mergedIndices.push(k);

    steps.push({
      type: 'copy-remaining',
      array: [...a],
      elementIds: [...ids],
      activeRange: [left, right],
      leftRange: [left, mid],
      rightRange: [mid + 1, right],
      highlightIndices: [k],
      mergedIndices: [...mergedIndices],
      markedSorted: [],
      depth,
      recursionTree: cloneTree(rootTree),
      callStack: [...callStack],
      description: `Copy remaining left element ${a[k]} to index ${k}.`,
    });

    i++;
    k++;
  }

  // copy remaining right elements
  while (j < rightCopy.length) {
    a[k] = rightCopy[j];
    ids[k] = rightIds[j];
    mergedIndices.push(k);

    steps.push({
      type: 'copy-remaining',
      array: [...a],
      elementIds: [...ids],
      activeRange: [left, right],
      leftRange: [left, mid],
      rightRange: [mid + 1, right],
      highlightIndices: [k],
      mergedIndices: [...mergedIndices],
      markedSorted: [],
      depth,
      recursionTree: cloneTree(rootTree),
      callStack: [...callStack],
      description: `Copy remaining right element ${a[k]} to index ${k}.`,
    });

    j++;
    k++;
  }

  treeNode.state = 'sorted';

  steps.push({
    type: 'merge-complete',
    array: [...a],
    elementIds: [...ids],
    activeRange: [left, right],
    leftRange: [left, mid],
    rightRange: [mid + 1, right],
    highlightIndices: [],
    mergedIndices: rangeToIndices(left, right),
    markedSorted: rangeToIndices(left, right),
    depth,
    recursionTree: cloneTree(rootTree),
    callStack: [...callStack],
    description: `Merge complete for [${left}..${right}]: [${a.slice(left, right + 1).join(', ')}]. This sub-array is now sorted.`,
  });
}

// ---- tree utilities ----

function buildTree(left, right) {
  const node = { range: [left, right], state: 'pending', children: [] };
  if (left < right) {
    const mid = Math.floor((left + right) / 2);
    node.children.push(buildTree(left, mid));
    node.children.push(buildTree(mid + 1, right));
  }
  return node;
}

function cloneTree(node) {
  if (!node) return null;
  return {
    range: [...node.range],
    state: node.state,
    children: node.children.map(cloneTree),
  };
}

function rangeToIndices(left, right) {
  const arr = [];
  for (let i = left; i <= right; i++) arr.push(i);
  return arr;
}
