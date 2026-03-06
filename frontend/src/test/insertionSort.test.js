import { describe, it, expect } from 'vitest';
import { runInsertionSort } from '../algorithms/insertionSort';

/*
  Tests for the Insertion Sort step-recording engine.
  Verifies that the algorithm produces the correct sorted output,
  generates the expected step types, and handles edge cases.
*/

describe('Insertion Sort', () => {
  it('should sort a basic unsorted array', () => {
    const steps = runInsertionSort([5, 3, 8, 1, 2]);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.type).toBe('done');
    expect(lastStep.array).toEqual([1, 2, 3, 5, 8]);
    expect(lastStep.markedSorted).toEqual([0, 1, 2, 3, 4]);
  });

  it('should handle an already sorted array', () => {
    const steps = runInsertionSort([1, 2, 3, 4]);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.type).toBe('done');
    expect(lastStep.array).toEqual([1, 2, 3, 4]);
    // fewer steps because no shifts are needed
    const shiftSteps = steps.filter((s) => s.type === 'shift');
    expect(shiftSteps.length).toBe(0);
  });

  it('should handle a reverse-sorted array', () => {
    const steps = runInsertionSort([4, 3, 2, 1]);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.type).toBe('done');
    expect(lastStep.array).toEqual([1, 2, 3, 4]);
    // reverse order requires maximum shifts
    const shiftSteps = steps.filter((s) => s.type === 'shift');
    expect(shiftSteps.length).toBe(6); // 1+2+3 = 6
  });

  it('should handle a single-element array', () => {
    const steps = runInsertionSort([42]);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.type).toBe('done');
    expect(lastStep.array).toEqual([42]);
    // only init + done
    expect(steps.length).toBe(2);
  });

  it('should handle an empty array', () => {
    const steps = runInsertionSort([]);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.type).toBe('done');
    expect(lastStep.array).toEqual([]);
  });

  it('should handle duplicate values', () => {
    const steps = runInsertionSort([3, 1, 3, 2, 1]);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.type).toBe('done');
    expect(lastStep.array).toEqual([1, 1, 2, 3, 3]);
  });

  it('should record the correct step type sequence', () => {
    const steps = runInsertionSort([3, 1]);
    const types = steps.map((s) => s.type);
    // init -> select-key(1) -> compare(0) -> shift(0) -> insert -> done
    expect(types[0]).toBe('init');
    expect(types[1]).toBe('select-key');
    expect(types).toContain('compare');
    expect(types).toContain('shift');
    expect(types).toContain('insert');
    expect(types[types.length - 1]).toBe('done');
  });

  it('should track sorted boundary correctly', () => {
    const steps = runInsertionSort([5, 3, 8]);
    // after each insert step, sortedBoundary should grow
    const insertSteps = steps.filter((s) => s.type === 'insert');
    expect(insertSteps[0].sortedBoundary).toBe(2);
    expect(insertSteps[1].sortedBoundary).toBe(3);
  });

  it('should include key value in select-key steps', () => {
    const steps = runInsertionSort([10, 7, 15]);
    const selectSteps = steps.filter((s) => s.type === 'select-key');
    expect(selectSteps[0].keyValue).toBe(7);
    expect(selectSteps[0].keyIndex).toBe(1);
    expect(selectSteps[1].keyValue).toBe(15);
    expect(selectSteps[1].keyIndex).toBe(2);
  });
});
