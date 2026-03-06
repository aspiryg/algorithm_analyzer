/*
  Insertion Sort -- step-by-step recording engine.

  Records every comparison, shift, and insertion so we can
  play them back with bar-chart animations.

  Step shape:
    {
      type:            'init' | 'select-key' | 'compare' | 'shift' | 'insert' | 'done'
      array:           number[]        – full array state after this step
      sortedBoundary:  number          – everything to the left of this index is sorted
      keyIndex:        number | null   – outer loop index (the element being inserted)
      keyValue:        number | null   – value of the key being inserted
      compareIndex:    number | null   – inner loop index being compared against
      highlightIndices:number[]        – indices to highlight (comparing / moving)
      markedSorted:    number[]        – indices confirmed as sorted
      description:     string          – human-readable narration
    }
*/

export function runInsertionSort(arr) {
  const a = [...arr];
  const n = a.length;
  const steps = [];

  // Track element identities so the visualizer can animate bars
  // horizontally when they change position (instead of just changing height).
  // IDs 0..n-1 are the real element identities.
  // During shifts, the source position becomes a "hole" — we assign it a
  // unique temporary ID (starting at n) so no snapshot ever has duplicates.
  const ids = Array.from({ length: n }, (_, i) => i);
  let holeCounter = n;

  steps.push({
    type: 'init',
    array: [...a],
    elementIds: [...ids],
    sortedBoundary: 1,
    keyIndex: null,
    keyValue: null,
    compareIndex: null,
    highlightIndices: [],
    markedSorted: [0],
    description: `Starting Insertion Sort on ${n} elements. The first element is trivially sorted.`,
  });

  for (let i = 1; i < n; i++) {
    const key = a[i];
    const keyId = ids[i];

    steps.push({
      type: 'select-key',
      array: [...a],
      elementIds: [...ids],
      sortedBoundary: i,
      keyIndex: i,
      keyValue: key,
      compareIndex: null,
      highlightIndices: [i],
      markedSorted: Array.from({ length: i }, (_, k) => k),
      description: `Pick element at index ${i} (value ${key}) as the key to insert into the sorted portion.`,
    });

    let j = i - 1;

    while (j >= 0) {
      // compare
      steps.push({
        type: 'compare',
        array: [...a],
        elementIds: [...ids],
        sortedBoundary: i,
        keyIndex: i,
        keyValue: key,
        compareIndex: j,
        highlightIndices: [j, i],
        markedSorted: Array.from({ length: i }, (_, k) => k),
        description: `Compare key ${key} with element at index ${j} (value ${a[j]}). ${a[j] > key ? `${a[j]} > ${key}, need to shift right.` : `${a[j]} ≤ ${key}, found insertion point.`}`,
      });

      if (a[j] > key) {
        a[j + 1] = a[j];
        ids[j + 1] = ids[j];
        // Mark the source position as a "hole" with a unique temp ID
        // so the snapshot never has duplicate element IDs.
        ids[j] = holeCounter++;

        steps.push({
          type: 'shift',
          array: [...a],
          elementIds: [...ids],
          sortedBoundary: i,
          keyIndex: i,
          keyValue: key,
          compareIndex: j,
          highlightIndices: [j, j + 1],
          markedSorted: Array.from({ length: i }, (_, k) => k),
          description: `Shift element ${a[j]} from index ${j} to index ${j + 1}.`,
        });

        j--;
      } else {
        break;
      }
    }

    a[j + 1] = key;
    ids[j + 1] = keyId;

    steps.push({
      type: 'insert',
      array: [...a],
      elementIds: [...ids],
      sortedBoundary: i + 1,
      keyIndex: j + 1,
      keyValue: key,
      compareIndex: null,
      highlightIndices: [j + 1],
      markedSorted: Array.from({ length: i + 1 }, (_, k) => k),
      description: `Insert key ${key} at index ${j + 1}. The sorted region now spans indices 0–${i}.`,
    });
  }

  steps.push({
    type: 'done',
    array: [...a],
    elementIds: [...ids],
    sortedBoundary: n,
    keyIndex: null,
    keyValue: null,
    compareIndex: null,
    highlightIndices: [],
    markedSorted: Array.from({ length: n }, (_, k) => k),
    description: `Insertion Sort complete! The array is now fully sorted.`,
  });

  return steps;
}
