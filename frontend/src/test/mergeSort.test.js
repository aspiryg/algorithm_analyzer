import { describe, it, expect } from 'vitest';
import { runMergeSort } from '../algorithms/mergeSort';

/*
  Tests for the Merge Sort step-recording engine.
  Verifies correct sorting, recursion tree structure,
  call stack tracking, and edge cases.
*/

describe('Merge Sort', () => {
  it('should sort a basic unsorted array', () => {
    const steps = runMergeSort([5, 3, 8, 1, 2]);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.type).toBe('done');
    expect(lastStep.array).toEqual([1, 2, 3, 5, 8]);
    expect(lastStep.markedSorted).toEqual([0, 1, 2, 3, 4]);
  });

  it('should handle an already sorted array', () => {
    const steps = runMergeSort([1, 2, 3, 4]);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.type).toBe('done');
    expect(lastStep.array).toEqual([1, 2, 3, 4]);
  });

  it('should handle a reverse-sorted array', () => {
    const steps = runMergeSort([4, 3, 2, 1]);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.type).toBe('done');
    expect(lastStep.array).toEqual([1, 2, 3, 4]);
  });

  it('should handle a single-element array', () => {
    const steps = runMergeSort([42]);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.type).toBe('done');
    expect(lastStep.array).toEqual([42]);
    // only init + done (no splits or merges needed)
    expect(steps.length).toBe(2);
  });

  it('should handle a two-element array', () => {
    const steps = runMergeSort([9, 4]);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.type).toBe('done');
    expect(lastStep.array).toEqual([4, 9]);
    // should have split, compare, merge-pick, merge-complete steps
    expect(steps.some((s) => s.type === 'split')).toBe(true);
    expect(steps.some((s) => s.type === 'compare')).toBe(true);
    expect(steps.some((s) => s.type === 'merge-complete')).toBe(true);
  });

  it('should handle duplicate values', () => {
    const steps = runMergeSort([3, 1, 3, 2, 1]);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.type).toBe('done');
    expect(lastStep.array).toEqual([1, 1, 2, 3, 3]);
  });

  it('should record the correct step type sequence', () => {
    const steps = runMergeSort([3, 1]);
    const types = steps.map((s) => s.type);
    expect(types[0]).toBe('init');
    expect(types).toContain('split');
    expect(types).toContain('compare');
    expect(types).toContain('merge-complete');
    expect(types[types.length - 1]).toBe('done');
  });

  it('should produce a valid recursion tree', () => {
    const steps = runMergeSort([5, 3, 8, 1]);
    const initStep = steps[0];
    const tree = initStep.recursionTree;

    // root should span entire array
    expect(tree.range).toEqual([0, 3]);
    expect(tree.state).toBe('pending');
    // root should have two children
    expect(tree.children.length).toBe(2);
    expect(tree.children[0].range).toEqual([0, 1]);
    expect(tree.children[1].range).toEqual([2, 3]);
  });

  it('should show all tree nodes as sorted at the end', () => {
    const steps = runMergeSort([5, 3, 8, 1]);
    const lastStep = steps[steps.length - 1];
    const tree = lastStep.recursionTree;

    function checkAllSorted(node) {
      expect(node.state).toBe('sorted');
      node.children.forEach(checkAllSorted);
    }
    checkAllSorted(tree);
  });

  it('should track call stack correctly', () => {
    const steps = runMergeSort([5, 3, 8, 1]);
    // after the first split, the call stack should contain the top-level call
    const splitSteps = steps.filter((s) => s.type === 'split');
    expect(splitSteps.length).toBeGreaterThan(0);
    // first split is the top-level: sort(0..3)
    expect(splitSteps[0].callStack.length).toBe(1);
    expect(splitSteps[0].callStack[0].range).toEqual([0, 3]);
  });

  it('should track depth correctly', () => {
    const steps = runMergeSort([5, 3, 8, 1]);
    const splitSteps = steps.filter((s) => s.type === 'split');
    // first split is depth 0
    expect(splitSteps[0].depth).toBe(0);
    // second split should be deeper
    expect(splitSteps[1].depth).toBeGreaterThan(0);
  });

  it('should track active ranges during merge', () => {
    const steps = runMergeSort([9, 4]);
    const compareStep = steps.find((s) => s.type === 'compare');
    expect(compareStep.leftRange).toEqual([0, 0]);
    expect(compareStep.rightRange).toEqual([1, 1]);
    expect(compareStep.activeRange).toEqual([0, 1]);
  });
});
