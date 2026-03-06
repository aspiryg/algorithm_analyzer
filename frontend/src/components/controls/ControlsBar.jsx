import { useState, useCallback } from 'react';
import {
  Play, Pause, SkipForward, SkipBack, RotateCcw,
  Zap, Trash2,
} from 'lucide-react';
import algorithms from '../../algorithms';
import useGraphStore from '../../store/graphStore';
import useVisualizationStore from '../../store/visualizationStore';
import './ControlsBar.css';

/*
  ControlsBar -- sits above the canvas and provides:
    1. Algorithm selection dropdown
    2. Playback controls (play, pause, step forward/back, reset)
    3. Speed slider
    4. Graph settings (weighted, directed toggles)
    5. Clear graph button
*/

export default function ControlsBar() {
  const [selectedAlgo, setSelectedAlgo] = useState('bfs');

  const {
    nodes, edges, startNodeId, endNodeId,
    getAdjacencyList, clearGraph,
    weighted, directed, setWeighted, setDirected,
  } = useGraphStore();

  const {
    steps, currentStepIndex, isPlaying,
    speed, setSpeed,
    play, pause, stepForward, stepBackward, reset,
    loadSteps, clearVisualization,
  } = useVisualizationStore();

  const hasNodes = nodes.length > 0;
  const hasStartAndEnd = startNodeId && endNodeId;
  const isRunning = steps.length > 0;

  // run the selected algorithm and load the resulting steps
  const handleRun = useCallback(() => {
    if (!hasStartAndEnd) return;

    const algo = algorithms[selectedAlgo];
    if (!algo) return;

    const adj = getAdjacencyList();
    const resultSteps = algo.run(adj, startNodeId, endNodeId);
    loadSteps(resultSteps, algo.name);
  }, [selectedAlgo, hasStartAndEnd, getAdjacencyList, startNodeId, endNodeId, loadSteps]);

  const handleClear = useCallback(() => {
    clearVisualization();
    clearGraph();
  }, [clearVisualization, clearGraph]);

  const handleResetViz = useCallback(() => {
    clearVisualization();
  }, [clearVisualization]);

  // speed slider: 50ms (fast) to 2000ms (slow)
  // we invert the display so sliding right = faster
  const handleSpeedChange = (e) => {
    const raw = parseInt(e.target.value, 10);
    // slider goes 50-2000; we invert: high slider value = low delay
    setSpeed(2050 - raw);
  };

  const speedLabel = speed < 200 ? 'Fast' : speed < 600 ? 'Normal' : speed < 1200 ? 'Slow' : 'Crawl';

  return (
    <div className="controls-bar">
      {/* algorithm selector */}
      <div className="controls-bar__select-group">
        <span className="controls-bar__label">Algorithm</span>
        <select
          className="controls-bar__select"
          value={selectedAlgo}
          onChange={(e) => { setSelectedAlgo(e.target.value); clearVisualization(); }}
          disabled={isPlaying}
        >
          {Object.entries(algorithms).map(([key, algo]) => (
            <option key={key} value={key}>{algo.name}</option>
          ))}
        </select>
      </div>

      <div className="controls-bar__divider" />

      {/* run button */}
      <button
        className="controls-bar__btn controls-bar__btn--primary"
        onClick={handleRun}
        disabled={!hasStartAndEnd || isPlaying}
        title={!hasStartAndEnd ? 'Set a start and end node first (right-click a node)' : 'Run algorithm'}
      >
        <Zap size={14} />
        Run
      </button>

      <div className="controls-bar__divider" />

      {/* playback controls */}
      <div className="controls-bar__playback">
        <button
          className="controls-bar__btn"
          onClick={stepBackward}
          disabled={!isRunning || currentStepIndex <= 0}
          title="Step backward"
        >
          <SkipBack size={14} />
        </button>

        {isPlaying ? (
          <button className="controls-bar__btn" onClick={pause} title="Pause">
            <Pause size={14} />
          </button>
        ) : (
          <button
            className="controls-bar__btn"
            onClick={play}
            disabled={!isRunning}
            title="Play"
          >
            <Play size={14} />
          </button>
        )}

        <button
          className="controls-bar__btn"
          onClick={stepForward}
          disabled={!isRunning || currentStepIndex >= steps.length - 1}
          title="Step forward"
        >
          <SkipForward size={14} />
        </button>

        <button
          className="controls-bar__btn"
          onClick={reset}
          disabled={!isRunning}
          title="Reset visualization"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* step counter */}
      {isRunning && (
        <span className="controls-bar__step-counter">
          {currentStepIndex + 1}/{steps.length}
        </span>
      )}

      <div className="controls-bar__divider" />

      {/* speed slider */}
      <div className="controls-bar__speed">
        <span className="controls-bar__label">Speed</span>
        <input
          type="range"
          className="controls-bar__speed-slider"
          min={50}
          max={2000}
          step={50}
          value={2050 - speed}
          onChange={handleSpeedChange}
        />
        <span className="controls-bar__speed-value">{speedLabel}</span>
      </div>

      {/* spacer */}
      <div className="controls-bar__toggles">
        <label className="controls-bar__toggle">
          <input
            type="checkbox"
            checked={weighted}
            onChange={(e) => setWeighted(e.target.checked)}
            disabled={isRunning}
          />
          Weighted
        </label>
        <label className="controls-bar__toggle">
          <input
            type="checkbox"
            checked={directed}
            onChange={(e) => setDirected(e.target.checked)}
            disabled={isRunning}
          />
          Directed
        </label>

        <div className="controls-bar__divider" />

        <button
          className="controls-bar__btn controls-bar__btn--danger"
          onClick={isRunning ? handleResetViz : handleClear}
          title={isRunning ? 'Clear visualization' : 'Clear entire graph'}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
