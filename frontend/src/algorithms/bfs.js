/*
  BFS (Breadth-First Search) algorithm engine.

  This doesn't just run BFS -- it records every single step of the execution
  so we can play it back visually. Each step captures a snapshot of:
    - the queue
    - visited set
    - current node being processed
    - the parent map (for reconstructing the path)
    - which edges have been explored
    - a human-readable description of what's happening

  Input:
    adjacencyList  - { nodeId: [{ node: neighborId, weight: number }] }
    startId        - string
    endId          - string (can be null for full traversal)

  Output:
    Array of step objects (see visualizationStore for shape)
*/

export function runBFS(adjacencyList, startId, endId) {
  const steps = [];
  const visited = new Set();
  const parent = {};
  const queue = [startId];

  visited.add(startId);
  parent[startId] = null;

  // Record the initial state
  steps.push({
    type: 'init',
    currentNode: startId,
    queue: [...queue],
    visited: [...visited],
    parent: { ...parent },
    path: [],
    exploredEdges: [],
    description: `Starting BFS from node "${startId}". Added it to the queue.`,
  });

  const exploredEdges = [];

  while (queue.length > 0) {
    // Dequeue the first node
    const current = queue.shift();

    steps.push({
      type: 'dequeue',
      currentNode: current,
      queue: [...queue],
      visited: [...visited],
      parent: { ...parent },
      path: [],
      exploredEdges: [...exploredEdges],
      description: `Dequeued "${current}" from the front of the queue. Processing its neighbors.`,
    });

    // Check if we've reached the destination
    if (endId && current === endId) {
      const path = reconstructPath(parent, endId);
      steps.push({
        type: 'found',
        currentNode: current,
        queue: [...queue],
        visited: [...visited],
        parent: { ...parent },
        path,
        exploredEdges: [...exploredEdges],
        description: `Found the destination "${endId}". Path: ${path.join(' -> ')}`,
      });
      return steps;
    }

    // Explore neighbors
    const neighbors = adjacencyList[current] || [];
    for (const { node: neighbor } of neighbors) {
      exploredEdges.push({ source: current, target: neighbor });

      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parent[neighbor] = current;
        queue.push(neighbor);

        steps.push({
          type: 'enqueue',
          currentNode: current,
          queue: [...queue],
          visited: [...visited],
          parent: { ...parent },
          path: [],
          exploredEdges: [...exploredEdges],
          description: `Neighbor "${neighbor}" has not been visited. Marked as visited and added to the queue.`,
        });
      } else {
        steps.push({
          type: 'skip',
          currentNode: current,
          queue: [...queue],
          visited: [...visited],
          parent: { ...parent },
          path: [],
          exploredEdges: [...exploredEdges],
          description: `Neighbor "${neighbor}" was already visited. Skipping.`,
        });
      }
    }
  }

  // If we get here, we explored the whole reachable graph
  const path = endId ? reconstructPath(parent, endId) : [];
  steps.push({
    type: 'done',
    currentNode: null,
    queue: [],
    visited: [...visited],
    parent: { ...parent },
    path,
    exploredEdges: [...exploredEdges],
    description: endId
      ? `BFS complete. ${path.length > 0 ? `Path found: ${path.join(' -> ')}` : 'No path exists to the destination.'}`
      : `BFS complete. All reachable nodes have been visited.`,
  });

  return steps;
}

// Walk backward through the parent map to build the path
function reconstructPath(parent, endId) {
  const path = [];
  let current = endId;
  while (current !== null && current !== undefined) {
    path.unshift(current);
    current = parent[current];
  }
  // if the path doesn't actually lead back to the start, return empty
  if (path.length > 0 && parent[path[0]] === null) {
    return path;
  }
  return [];
}
