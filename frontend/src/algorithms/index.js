/*
  Algorithm registry.
  
  Central mapping of available algorithms. When adding a new algorithm,
  register it here and the UI will pick it up automatically.
*/

import { runBFS } from './bfs';
import { runDFS } from './dfs';
import { runInsertionSort } from './insertionSort';
import { runMergeSort } from './mergeSort';

const algorithms = {
  bfs: {
    name: 'Breadth-First Search',
    shortName: 'BFS',
    category: 'path-finding',
    run: runBFS,
    // what kind of internal data structure does this algorithm use?
    dataStructureLabel: 'Queue',
    description: 'Explores the graph level by level, visiting all neighbors before moving deeper. Guarantees shortest path in unweighted graphs.',
  },
  dfs: {
    name: 'Depth-First Search',
    shortName: 'DFS',
    category: 'path-finding',
    run: runDFS,
    dataStructureLabel: 'Stack',
    description: 'Explores as deep as possible along each branch before backtracking. Does not guarantee shortest path.',
  },
  insertionSort: {
    name: 'Insertion Sort',
    shortName: 'Insertion',
    category: 'sorting',
    run: runInsertionSort,
    dataStructureLabel: 'Array',
    description: 'Builds the sorted array one element at a time by inserting each into its correct position. O(n²) average, O(n) best case.',
  },
  mergeSort: {
    name: 'Merge Sort',
    shortName: 'Merge',
    category: 'sorting',
    run: runMergeSort,
    dataStructureLabel: 'Array',
    description: 'Divides the array in half, recursively sorts each half, then merges them. O(n log n) guaranteed. Demonstrates divide & conquer.',
  },
  // future: dijkstra, a-star, bellman-ford, selectionSort, bubbleSort, quickSort, etc.
};

export default algorithms;
