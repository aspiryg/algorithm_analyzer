/*
  DFS (Depth-First Search) algorithm engine.

  Same recording approach as BFS, but using a stack instead of a queue.
  DFS explores as deep as possible along each branch before backtracking.

  We implement this iteratively (with an explicit stack) rather than recursively
  so the step recording is cleaner and we avoid call stack issues on large graphs.
  But we still show the "stack" and talk about it in the descriptions to help
  the user understand the recursive nature of DFS.

  Input / Output follow the same contract as bfs.js
*/

export function runDFS(adjacencyList, startId, endId) {
  const steps = [];
  const visited = new Set();
  const parent = {};
  const stack = [startId];

  parent[startId] = null;

  // initial state
  steps.push({
    type: 'init',
    currentNode: startId,
    stack: [...stack],
    visited: [...visited],
    parent: { ...parent },
    path: [],
    exploredEdges: [],
    description: `Starting DFS from node "${startId}". Pushed it onto the stack.`,
  });

  const exploredEdges = [];

  while (stack.length > 0) {
    // Pop from the top of the stack (LIFO order)
    const current = stack.pop();

    if (visited.has(current)) {
      steps.push({
        type: 'skip',
        currentNode: current,
        stack: [...stack],
        visited: [...visited],
        parent: { ...parent },
        path: [],
        exploredEdges: [...exploredEdges],
        description: `Popped "${current}" from the stack, but it's already visited. Skipping.`,
      });
      continue;
    }

    visited.add(current);

    steps.push({
      type: 'visit',
      currentNode: current,
      stack: [...stack],
      visited: [...visited],
      parent: { ...parent },
      path: [],
      exploredEdges: [...exploredEdges],
      description: `Popped "${current}" from the stack and marked as visited.`,
    });

    // Did we find the destination?
    if (endId && current === endId) {
      const path = reconstructPath(parent, endId);
      steps.push({
        type: 'found',
        currentNode: current,
        stack: [...stack],
        visited: [...visited],
        parent: { ...parent },
        path,
        exploredEdges: [...exploredEdges],
        description: `Found the destination "${endId}". Path: ${path.join(' -> ')}`,
      });
      return steps;
    }

    // Push neighbors onto the stack (in reverse order so we visit them
    // in the natural order -- first neighbor gets popped first)
    const neighbors = adjacencyList[current] || [];
    const reversedNeighbors = [...neighbors].reverse();

    for (const { node: neighbor } of reversedNeighbors) {
      exploredEdges.push({ source: current, target: neighbor });

      if (!visited.has(neighbor)) {
        // only set parent if not already set (first discovery)
        if (parent[neighbor] === undefined) {
          parent[neighbor] = current;
        }
        stack.push(neighbor);

        steps.push({
          type: 'push',
          currentNode: current,
          stack: [...stack],
          visited: [...visited],
          parent: { ...parent },
          path: [],
          exploredEdges: [...exploredEdges],
          description: `Pushing unvisited neighbor "${neighbor}" onto the stack.`,
        });
      } else {
        steps.push({
          type: 'skip-neighbor',
          currentNode: current,
          stack: [...stack],
          visited: [...visited],
          parent: { ...parent },
          path: [],
          exploredEdges: [...exploredEdges],
          description: `Neighbor "${neighbor}" already visited. Not pushing to stack.`,
        });
      }
    }
  }

  // traversal complete
  const path = endId ? reconstructPath(parent, endId) : [];
  steps.push({
    type: 'done',
    currentNode: null,
    stack: [],
    visited: [...visited],
    parent: { ...parent },
    path,
    exploredEdges: [...exploredEdges],
    description: endId
      ? `DFS complete. ${path.length > 0 ? `Path found: ${path.join(' -> ')}` : 'No path exists to the destination.'}`
      : `DFS complete. All reachable nodes have been visited.`,
  });

  return steps;
}

function reconstructPath(parent, endId) {
  const path = [];
  let current = endId;
  while (current !== null && current !== undefined) {
    path.unshift(current);
    current = parent[current];
  }
  if (path.length > 0 && parent[path[0]] === null) {
    return path;
  }
  return [];
}
