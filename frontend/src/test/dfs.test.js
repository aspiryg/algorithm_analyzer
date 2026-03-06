import { describe, it, expect } from 'vitest';
import { runDFS } from '../algorithms/dfs';

/*
  Basic tests for the DFS algorithm engine.
*/

function buildAdj(nodeIds, edgeList) {
  const adj = {};
  nodeIds.forEach((id) => (adj[id] = []));
  edgeList.forEach(([a, b]) => {
    adj[a].push({ node: b, weight: 1 });
    adj[b].push({ node: a, weight: 1 });
  });
  return adj;
}

describe('DFS Algorithm', () => {
  it('should find a path in a simple graph', () => {
    const adj = buildAdj(
      ['node-1', 'node-2', 'node-3'],
      [['node-1', 'node-2'], ['node-2', 'node-3']]
    );

    const steps = runDFS(adj, 'node-1', 'node-3');
    const lastStep = steps[steps.length - 1];
    expect(lastStep.type).toBe('found');
    expect(lastStep.path).toContain('node-1');
    expect(lastStep.path).toContain('node-3');
  });

  it('should handle unreachable destination', () => {
    const adj = buildAdj(
      ['node-1', 'node-2', 'node-3'],
      [['node-1', 'node-2']]
    );

    const steps = runDFS(adj, 'node-1', 'node-3');
    const lastStep = steps[steps.length - 1];
    expect(lastStep.type).toBe('done');
    expect(lastStep.path).toEqual([]);
  });

  it('should use a stack (LIFO order)', () => {
    const adj = buildAdj(
      ['node-1', 'node-2', 'node-3', 'node-4'],
      [
        ['node-1', 'node-2'],
        ['node-1', 'node-3'],
        ['node-2', 'node-4'],
      ]
    );

    const steps = runDFS(adj, 'node-1', 'node-4');
    // DFS should use a stack, so we should see "push" and "visit" step types
    const stepTypes = steps.map((s) => s.type);
    expect(stepTypes).toContain('push');
    expect(stepTypes).toContain('visit');
  });

  it('should visit all reachable nodes when no destination is set', () => {
    const adj = buildAdj(
      ['node-1', 'node-2', 'node-3'],
      [['node-1', 'node-2'], ['node-2', 'node-3']]
    );

    const steps = runDFS(adj, 'node-1', null);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.type).toBe('done');
    expect(lastStep.visited).toContain('node-1');
    expect(lastStep.visited).toContain('node-2');
    expect(lastStep.visited).toContain('node-3');
  });
});
