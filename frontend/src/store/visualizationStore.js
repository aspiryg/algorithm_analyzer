import { create } from 'zustand';

/*
  Visualization store -- drives the step-by-step playback of algorithm execution.

  The algorithm engine produces an array of "steps", where each step is a snapshot
  of the algorithm's internal state at that moment. This store manages:

    - the list of steps
    - the current step index
    - playback state (playing, paused, speed)
    - visual state derived from the current step (which nodes are visited, queued, etc.)

  Step shape (example for BFS/DFS):
    {
      type: 'visit' | 'enqueue' | 'dequeue' | 'check-neighbor' | 'found' | 'done',
      currentNode: string,
      queue: string[],          // or stack for DFS
      visited: string[],
      path: string[],           // the path found so far
      parent: { [nodeId]: nodeId },
      description: string,      // human-readable explanation of this step
    }
*/

const useVisualizationStore = create((set, get) => ({
  steps: [],
  currentStepIndex: -1,
  isPlaying: false,
  isPaused: false,
  speed: 500,             // ms between steps
  algorithmName: '',
  isComplete: false,
  intervalId: null,

  // The visual state at the current step (derived on each step change)
  visualState: {
    visitedNodes: [],
    queuedNodes: [],
    currentNode: null,
    path: [],
    exploredEdges: [],
    description: '',
    dataStructure: [],       // contents of the queue/stack at this step
    parentMap: {},
  },

  // Load steps produced by an algorithm run
  loadSteps: (steps, algorithmName) => {
    set({
      steps,
      currentStepIndex: -1,
      isPlaying: false,
      isPaused: false,
      isComplete: false,
      algorithmName,
      visualState: {
        visitedNodes: [],
        queuedNodes: [],
        currentNode: null,
        path: [],
        exploredEdges: [],
        description: 'Ready to start. Press play or step forward.',
        dataStructure: [],
        parentMap: {},
      },
    });
  },

  // Move to a specific step
  goToStep: (index) => {
    const { steps } = get();
    if (index < 0 || index >= steps.length) return;

    const step = steps[index];
    set({
      currentStepIndex: index,
      isComplete: index === steps.length - 1,
      visualState: {
        visitedNodes: step.visited || [],
        queuedNodes: step.queue || step.stack || [],
        currentNode: step.currentNode || null,
        path: step.path || [],
        exploredEdges: step.exploredEdges || [],
        description: step.description || '',
        dataStructure: step.queue || step.stack || [],
        parentMap: step.parent || {},
      },
    });
  },

  // Step forward by one
  stepForward: () => {
    const { currentStepIndex, steps } = get();
    const next = currentStepIndex + 1;
    if (next < steps.length) {
      get().goToStep(next);
    }
  },

  // Step backward by one
  stepBackward: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      get().goToStep(currentStepIndex - 1);
    }
  },

  // Auto-play the algorithm
  play: () => {
    const { isPlaying, steps, currentStepIndex, speed } = get();
    if (isPlaying) return;

    // if we're at the end, restart
    let startIdx = currentStepIndex;
    if (startIdx >= steps.length - 1) {
      startIdx = -1;
    }

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
    // immediately step to the first/next step
    get().goToStep(startIdx + 1);
  },

  pause: () => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    set({ isPlaying: false, isPaused: true, intervalId: null });
  },

  // Reset to beginning
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
        visitedNodes: [],
        queuedNodes: [],
        currentNode: null,
        path: [],
        exploredEdges: [],
        description: 'Reset. Press play or step forward.',
        dataStructure: [],
        parentMap: {},
      },
    });
  },

  setSpeed: (speed) => {
    const { isPlaying } = get();
    set({ speed });
    // if currently playing, restart the interval with the new speed
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
      algorithmName: '',
      visualState: {
        visitedNodes: [],
        queuedNodes: [],
        currentNode: null,
        path: [],
        exploredEdges: [],
        description: '',
        dataStructure: [],
        parentMap: {},
      },
    });
  },
}));

export default useVisualizationStore;
