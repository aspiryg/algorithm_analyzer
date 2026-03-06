import { describe, it, expect } from 'vitest';
import { runBFS } from '../algorithms/bfs';

/*
  Basic tests for the BFS algorithm engine.
  These verify that the step recording is correct and that
  BFS finds the shortest path in an unweighted graph.
*/

// helper to build a simple adjacency list from an edge list
function buildAdj(nodeIds, edgeList) {
  const adj = {};
  nodeIds.forEach((id) => (adj[id] = []));
  edgeList.forEach(([a, b]) => {
    adj[a].push({ node: b, weight: 1 });
    adj[b].push({ node: a, weight: 1 });
  });
  return adj;
}

describe('BFS Algorithm', () => {
  it('should find a path in a simple graph', () => {
    // graph: 1 -- 2 -- 3
    const adj = buildAdj(
      ['node-1', 'node-2', 'node-3'],
      [['node-1', 'node-2'], ['node-2', 'node-3']]
    );

    const steps = runBFS(adj, 'node-1', 'node-3');
    // should end with a "found" step
    const lastStep = steps[steps.length - 1];
    expect(lastStep.type).toBe('found');
    expect(lastStep.path).toEqual(['node-1', 'node-2', 'node-3']);
  });

  it('should handle unreachable destination', () => {
    // disconnected graph: 1--2 and 3 alone
    const adj = buildAdj(
      ['node-1', 'node-2', 'node-3'],
      [['node-1', 'node-2']]
    );

    const steps = runBFS(adj, 'node-1', 'node-3');
    const lastStep = steps[steps.length - 1];
    expect(lastStep.type).toBe('done');
    expect(lastStep.path).toEqual([]);
  });

  it('should find shortest path (not longest)', () => {
    // graph: 1--2--4, 1--3--4 (two paths of same length)
    //        1--4 direct
    const adj = buildAdj(
      ['node-1', 'node-2', 'node-3', 'node-4'],
      [
        ['node-1', 'node-2'],
        ['node-2', 'node-4'],
        ['node-1', 'node-3'],
        ['node-3', 'node-4'],
        ['node-1', 'node-4'],
      ]
    );

    const steps = runBFS(adj, 'node-1', 'node-4');
    const lastStep = steps[steps.length - 1];
    expect(lastStep.type).toBe('found');
    // BFS should find the direct path: 1 -> 4
    expect(lastStep.path).toEqual(['node-1', 'node-4']);
  });

  it('should record visited nodes correctly', () => {
    const adj = buildAdj(
      ['node-1', 'node-2', 'node-3'],
      [['node-1', 'node-2'], ['node-2', 'node-3']]
    );

    const steps = runBFS(adj, 'node-1', 'node-3');
    const lastStep = steps[steps.length - 1];
    expect(lastStep.visited).toContain('node-1');
    expect(lastStep.visited).toContain('node-2');
    expect(lastStep.visited).toContain('node-3');
  });
});
