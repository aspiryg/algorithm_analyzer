import { useState, useCallback } from 'react';
import {
  Play, Pause, SkipForward, SkipBack, RotateCcw,
  Zap, Shuffle, Trash2, BarChart3, GitBranch, Columns,
} from 'lucide-react';
import algorithms from '../../algorithms';
import useSortingVisualizationStore from '../../store/sortingVisualizationStore';
import './SortingControlsBar.css';

/*
  SortingControlsBar -- top bar for the sorting module.

  Sections:
    1. Number input (comma-separated or space-separated)
    2. Random array generator
    3. Algorithm selector (only sorting algorithms)
    4. Run button
    5. Playback controls (play, pause, step, reset)
    6. Speed slider
    7. View mode toggle (bars/tree/split) — only for merge sort
    8. Clear button
*/

// filter to only sorting algorithms
const sortingAlgorithms = Object.entries(algorithms)
  .filter(([, algo]) => algo.category === 'sorting');

// generate a random array of n integers between min and max
function randomArray(n = 15, min = 5, max = 100) {
  return Array.from({ length: n }, () =>
    Math.floor(Math.random() * (max - min + 1)) + min
  );
}

export default function SortingControlsBar({ viewMode, onViewModeChange, isMergeSort }) {
  const [selectedAlgo, setSelectedAlgo] = useState(
    sortingAlgorithms.length > 0 ? sortingAlgorithms[0][0] : ''
  );
  const [inputText, setInputText] = useState('');

  const {
    inputArray, setInputArray,
    steps, currentStepIndex, isPlaying,
    speed, setSpeed,
    play, pause, stepForward, stepBackward, reset,
    loadSteps, clearVisualization,
  } = useSortingVisualizationStore();

  const isRunning = steps.length > 0;
  const hasInput = inputArray.length >= 2;

  // parse the text input into a number array
  const handleInputChange = useCallback((e) => {
    const text = e.target.value;
    setInputText(text);

    // split on commas, spaces, or semicolons
    const nums = text
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter((s) => s !== '')
      .map(Number)
      .filter((n) => !isNaN(n));

    setInputArray(nums);
  }, [setInputArray]);

  // generate random array
  const handleRandom = useCallback(() => {
    const arr = randomArray();
    setInputArray(arr);
    setInputText(arr.join(', '));
    clearVisualization();
  }, [setInputArray, clearVisualization]);

  // run the selected sorting algorithm
  const handleRun = useCallback(() => {
    if (!hasInput || !selectedAlgo) return;

    const algo = algorithms[selectedAlgo];
    if (!algo) return;

    const resultSteps = algo.run([...inputArray]);
    loadSteps(resultSteps, selectedAlgo, algo.name);
  }, [selectedAlgo, hasInput, inputArray, loadSteps]);

  const handleClear = useCallback(() => {
    clearVisualization();
    setInputArray([]);
    setInputText('');
  }, [clearVisualization, setInputArray]);

  const handleResetViz = useCallback(() => {
    reset();
  }, [reset]);

  // speed slider: 50ms (fast) to 2000ms (slow), inverted
  const handleSpeedChange = (e) => {
    const raw = parseInt(e.target.value, 10);
    setSpeed(2050 - raw);
  };

  const speedLabel = speed < 200 ? 'Fast' : speed < 600 ? 'Normal' : speed < 1200 ? 'Slow' : 'Crawl';

  return (
    <div className="sorting-controls">
      {/* number input */}
      <div className="sorting-controls__input-group">
        <label className="sorting-controls__label" htmlFor="sorting-input">
          Numbers
        </label>
        <input
          id="sorting-input"
          className="sorting-controls__input"
          type="text"
          placeholder="e.g. 38, 27, 43, 3, 9, 82, 10"
          value={inputText}
          onChange={handleInputChange}
          disabled={isPlaying}
        />
        <button
          className="sorting-controls__btn sorting-controls__btn--secondary"
          onClick={handleRandom}
          disabled={isPlaying}
          title="Generate random array"
        >
          <Shuffle size={14} />
          Random
        </button>
      </div>

      <div className="sorting-controls__divider" />

      {/* algorithm selector */}
      <div className="sorting-controls__select-group">
        <span className="sorting-controls__label">Algorithm</span>
        <select
          className="sorting-controls__select"
          value={selectedAlgo}
          onChange={(e) => { setSelectedAlgo(e.target.value); clearVisualization(); }}
          disabled={isPlaying}
        >
          {sortingAlgorithms.map(([key, algo]) => (
            <option key={key} value={key}>{algo.name}</option>
          ))}
        </select>
      </div>

      <div className="sorting-controls__divider" />

      {/* run button */}
      <button
        className="sorting-controls__btn sorting-controls__btn--primary"
        onClick={handleRun}
        disabled={!hasInput || isPlaying}
        title={!hasInput ? 'Enter at least 2 numbers' : 'Run algorithm'}
      >
        <Zap size={14} />
        Run
      </button>

      <div className="sorting-controls__divider" />

      {/* playback */}
      <div className="sorting-controls__playback">
        <button
          className="sorting-controls__btn"
          onClick={stepBackward}
          disabled={!isRunning || currentStepIndex <= 0}
          title="Step backward"
        >
          <SkipBack size={14} />
        </button>

        {isPlaying ? (
          <button className="sorting-controls__btn" onClick={pause} title="Pause">
            <Pause size={14} />
          </button>
        ) : (
          <button
            className="sorting-controls__btn"
            onClick={play}
            disabled={!isRunning}
            title="Play"
          >
            <Play size={14} />
          </button>
        )}

        <button
          className="sorting-controls__btn"
          onClick={stepForward}
          disabled={!isRunning || currentStepIndex >= steps.length - 1}
          title="Step forward"
        >
          <SkipForward size={14} />
        </button>

        <button
          className="sorting-controls__btn"
          onClick={handleResetViz}
          disabled={!isRunning}
          title="Reset visualization"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* step counter */}
      {isRunning && (
        <span className="sorting-controls__step-counter">
          {currentStepIndex + 1}/{steps.length}
        </span>
      )}

      <div className="sorting-controls__divider" />

      {/* speed slider */}
      <div className="sorting-controls__speed">
        <span className="sorting-controls__label">Speed</span>
        <input
          type="range"
          className="sorting-controls__speed-slider"
          min={50}
          max={2000}
          step={50}
          value={2050 - speed}
          onChange={handleSpeedChange}
        />
        <span className="sorting-controls__speed-value">{speedLabel}</span>
      </div>

      {/* view mode toggle — merge sort only */}
      {isMergeSort && (
        <>
          <div className="sorting-controls__divider" />
          <div className="sorting-controls__view-toggle">
            <span className="sorting-controls__label">View</span>
            <div className="sorting-controls__view-btns">
              <button
                className={`sorting-controls__view-btn ${viewMode === 'bars' ? 'sorting-controls__view-btn--active' : ''}`}
                onClick={() => onViewModeChange('bars')}
                title="Bars only"
              >
                <BarChart3 size={13} />
              </button>
              <button
                className={`sorting-controls__view-btn ${viewMode === 'split' ? 'sorting-controls__view-btn--active' : ''}`}
                onClick={() => onViewModeChange('split')}
                title="Split view"
              >
                <Columns size={13} />
              </button>
              <button
                className={`sorting-controls__view-btn ${viewMode === 'tree' ? 'sorting-controls__view-btn--active' : ''}`}
                onClick={() => onViewModeChange('tree')}
                title="Tree dominant"
              >
                <GitBranch size={13} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* clear */}
      <button
        className="sorting-controls__btn sorting-controls__btn--danger"
        onClick={isRunning ? handleResetViz : handleClear}
        title={isRunning ? 'Clear visualization' : 'Clear everything'}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
