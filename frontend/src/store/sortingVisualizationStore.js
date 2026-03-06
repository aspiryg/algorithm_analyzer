import { create } from 'zustand';

/*
  Sorting visualization store.

  Similar to the pathfinding visualizationStore but tailored for sorting:
  - Manages an array of numbers (user input)
  - Stores algorithm steps with sorting-specific visual state
  - Handles playback (play, pause, step, reset, speed)
  - Derives per-step visual state (which bars are highlighted, sorted, etc.)

  Visual state shape (per step):
    {
      array:            number[]    – the array at this step
      highlightIndices: number[]    – indices being compared / moved
      markedSorted:     number[]    – indices confirmed sorted
      mergedIndices:    number[]    – indices placed during merge (merge sort)
      activeRange:      [l, r]      – sub-array range being processed
      leftRange:        [l, m]      – left half during merge
      rightRange:       [m+1, r]    – right half during merge
      keyValue:         number|null – insertion sort key
      keyIndex:         number|null – insertion sort key index
      recursionTree:    object|null – merge sort tree
      callStack:        object[]    – merge sort call stack
      depth:            number      – recursion depth
      description:      string
    }
*/

const useSortingVisualizationStore = create((set, get) => ({
  // ---- input ----
  inputArray: [],

  // ---- steps & playback ----
  steps: [],
  currentStepIndex: -1,
  isPlaying: false,
  isPaused: false,
  speed: 400,
  algorithmKey: '',
  algorithmName: '',
  isComplete: false,
  intervalId: null,

  // ---- derived visual state ----
  visualState: {
    array: [],
    elementIds: [],
    highlightIndices: [],
    markedSorted: [],
    mergedIndices: [],
    activeRange: null,
    leftRange: null,
    rightRange: null,
    keyValue: null,
    keyIndex: null,
    recursionTree: null,
    callStack: [],
    depth: 0,
    description: 'Enter numbers and pick a sorting algorithm to begin.',
  },

  // ---- actions ----

  setInputArray: (arr) => set({ inputArray: arr }),

  loadSteps: (steps, algorithmKey, algorithmName) => {
    set({
      steps,
      currentStepIndex: -1,
      isPlaying: false,
      isPaused: false,
      isComplete: false,
      algorithmKey,
      algorithmName,
      visualState: {
        array: steps.length > 0 ? steps[0].array : [],
        elementIds: steps.length > 0 ? (steps[0].elementIds || []) : [],
        highlightIndices: [],
        markedSorted: [],
        mergedIndices: [],
        activeRange: null,
        leftRange: null,
        rightRange: null,
        keyValue: null,
        keyIndex: null,
        recursionTree: null,
        callStack: [],
        depth: 0,
        description: 'Ready. Press play or step forward.',
      },
    });
  },

  goToStep: (index) => {
    const { steps } = get();
    if (index < 0 || index >= steps.length) return;

    const s = steps[index];
    set({
      currentStepIndex: index,
      isComplete: index === steps.length - 1,
      visualState: {
        array: s.array || [],
        elementIds: s.elementIds || [],
        highlightIndices: s.highlightIndices || [],
        markedSorted: s.markedSorted || [],
        mergedIndices: s.mergedIndices || [],
        activeRange: s.activeRange || null,
        leftRange: s.leftRange || null,
        rightRange: s.rightRange || null,
        keyValue: s.keyValue ?? null,
        keyIndex: s.keyIndex ?? null,
        recursionTree: s.recursionTree || null,
        callStack: s.callStack || [],
        depth: s.depth ?? 0,
        description: s.description || '',
      },
    });
  },

  stepForward: () => {
    const { currentStepIndex, steps } = get();
    const next = currentStepIndex + 1;
    if (next < steps.length) get().goToStep(next);
  },

  stepBackward: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) get().goToStep(currentStepIndex - 1);
  },

  play: () => {
    const { isPlaying, steps, currentStepIndex, speed } = get();
    if (isPlaying) return;

    let startIdx = currentStepIndex;
    if (startIdx >= steps.length - 1) startIdx = -1;

    const id = setInterval(() => {
      const { currentStepIndex: idx, steps: s } = get();
      const next = idx + 1;
      if (next >= s.length) {
        get().pause();
        set({ isComplete: true });
        return;
      }
      get().goToStep(next);
    }, speed);

    set({ isPlaying: true, isPaused: false, intervalId: id, currentStepIndex: startIdx });
    get().goToStep(startIdx + 1);
  },

  pause: () => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    set({ isPlaying: false, isPaused: true, intervalId: null });
  },

  reset: () => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    set({
      currentStepIndex: -1,
      isPlaying: false,
      isPaused: false,
      isComplete: false,
      intervalId: null,
      visualState: {
        array: get().inputArray,
        elementIds: get().inputArray.map((_, i) => i),
        highlightIndices: [],
        markedSorted: [],
        mergedIndices: [],
        activeRange: null,
        leftRange: null,
        rightRange: null,
        keyValue: null,
        keyIndex: null,
        recursionTree: null,
        callStack: [],
        depth: 0,
        description: 'Reset. Press play or step forward.',
      },
    });
  },

  setSpeed: (speed) => {
    const { isPlaying } = get();
    set({ speed });
    if (isPlaying) {
      get().pause();
      get().play();
    }
  },

  clearVisualization: () => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    set({
      steps: [],
      currentStepIndex: -1,
      isPlaying: false,
      isPaused: false,
      isComplete: false,
      intervalId: null,
      algorithmKey: '',
      algorithmName: '',
      visualState: {
        array: get().inputArray,
        elementIds: get().inputArray.map((_, i) => i),
        highlightIndices: [],
        markedSorted: [],
        mergedIndices: [],
        activeRange: null,
        leftRange: null,
        rightRange: null,
        keyValue: null,
        keyIndex: null,
        recursionTree: null,
        callStack: [],
        depth: 0,
        description: 'Enter numbers and pick a sorting algorithm to begin.',
      },
    });
  },
}));

export default useSortingVisualizationStore;
