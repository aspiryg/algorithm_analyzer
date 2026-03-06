import { motion, AnimatePresence } from 'framer-motion';
import useSortingVisualizationStore from '../../store/sortingVisualizationStore';
import MergeSortTreeView from './MergeSortTreeView';
import './SortingStatePanel.css';

/*
  SortingStatePanel -- right-side panel showing the sorting algorithm's
  internal state during visualization.

  Displays vary by algorithm:
    Insertion Sort:
      - Current key value and position
      - Sorted region boundary
      - Step description

    Merge Sort:
      - Recursion tree (via MergeSortTreeView)
      - Call stack
      - Active sub-array ranges (left, right halves)
      - Step description

  Common to all:
    - Color legend
    - Step description

  View mode support:
    - 'bars'  : bar chart is dominant, tree not shown in panel
    - 'tree'  : tree is dominant (shown in main area), panel shows state only
    - 'split' : both side by side (default)
*/

export default function SortingStatePanel({ viewMode = 'split' }) {
  const {
    steps, currentStepIndex, algorithmName, algorithmKey, visualState, speed, isPlaying,
  } = useSortingVisualizationStore();

  const isActive = steps.length > 0;
  const isMergeSort = algorithmKey === 'mergeSort';
  // At fast playback speeds, collapse the description to avoid layout jitter
  const isFastMode = isPlaying && speed < 200;

  if (!isActive) {
    return (
      <aside className="sorting-panel">
        <div className="sorting-panel__empty">
          <h4>Algorithm State</h4>
          <p>
            Enter a list of numbers, select a sorting algorithm,
            and click Run to watch its internal state here.
          </p>
        </div>
        <SortingLegend />
      </aside>
    );
  }

  return (
    <aside className="sorting-panel">
      {/* header */}
      <div className="sorting-panel__header">
        <div className="sorting-panel__title">Algorithm State</div>
        <div className="sorting-panel__algo-name">{algorithmName}</div>
      </div>

      {/* step description — fixed height to prevent layout jitter */}
      <div className={`sorting-panel__description ${isFastMode ? 'sorting-panel__description--fast' : ''}`}>
        {isFastMode
          ? <span className="sorting-panel__description-fast-text">Step {currentStepIndex + 1}/{steps.length}</span>
          : (visualState.description || 'Waiting...')}
      </div>

      {/* algorithm-specific sections */}
      {isMergeSort ? (
        <MergeSortDetails visualState={visualState} viewMode={viewMode} isFastMode={isFastMode} />
      ) : (
        <InsertionSortDetails visualState={visualState} isFastMode={isFastMode} />
      )}

      <SortingLegend isMergeSort={isMergeSort} />
    </aside>
  );
}

// ---- Insertion Sort details ----

function InsertionSortDetails({ visualState, isFastMode }) {
  const { keyValue, keyIndex, markedSorted, array } = visualState;

  return (
    <>
      {/* key info — always show, uses fixed layout */}
      {keyValue !== null && (
        <div className="sorting-panel__section">
          <div className="sorting-panel__section-title">Current Key</div>
          <div className="sorting-panel__key-info">
            <motion.div
              className="sorting-panel__key-badge"
              key={keyValue}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: isFastMode ? 0.05 : 0.15 }}
            >
              {keyValue}
            </motion.div>
            <span className="sorting-panel__key-detail">
              Inserting at index {keyIndex}
            </span>
          </div>
        </div>
      )}

      {/* sorted region */}
      <div className="sorting-panel__section">
        <div className="sorting-panel__section-title">
          Sorted Region
          <span className="sorting-panel__section-count">
            {markedSorted.length} / {array.length}
          </span>
        </div>
        <div className="sorting-panel__sorted-bar">
          <div
            className="sorting-panel__sorted-fill"
            style={{ width: `${(markedSorted.length / Math.max(array.length, 1)) * 100}%` }}
          />
        </div>
        {/* Hide individual chips at fast speed to avoid jitter */}
        {!isFastMode && (
          <div className="sorting-panel__sorted-items">
            <AnimatePresence>
              {markedSorted.map((idx) => (
                <motion.span
                  key={idx}
                  className="sorting-panel__sorted-chip"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.12 }}
                >
                  {array[idx]}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </>
  );
}

// ---- Merge Sort details ----

function MergeSortDetails({ visualState, viewMode, isFastMode }) {
  const {
    recursionTree, callStack, activeRange, leftRange, rightRange, array,
  } = visualState;

  // In "bars" view mode, don't show the tree in the panel
  // In "tree" mode, tree is rendered in the main area (SortingPage handles this)
  const showTreeInPanel = viewMode === 'split';

  return (
    <>
      {/* recursion tree (only in split mode) */}
      {recursionTree && showTreeInPanel && (
        <MergeSortTreeView tree={recursionTree} array={array} />
      )}

      {/* call stack — collapse at fast speed */}
      {callStack.length > 0 && !isFastMode && (
        <div className="sorting-panel__section">
          <div className="sorting-panel__section-title">
            Call Stack
            <span className="sorting-panel__section-count">{callStack.length}</span>
          </div>
          <div className="sorting-panel__call-stack">
            {[...callStack].reverse().map((frame, idx) => (
              <motion.div
                key={frame.label + idx}
                className={`sorting-panel__stack-frame ${idx === 0 ? 'sorting-panel__stack-frame--top' : ''}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.12 }}
              >
                <span className="sorting-panel__stack-label">{frame.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* sub-array ranges */}
      {activeRange && (
        <div className="sorting-panel__section">
          <div className="sorting-panel__section-title">Active Ranges</div>
          <div className="sorting-panel__ranges">
            <div className="sorting-panel__range">
              <span className="sorting-panel__range-label">Active</span>
              <span className="sorting-panel__range-value">
                [{activeRange[0]}..{activeRange[1]}]
              </span>
            </div>
            {leftRange && (
              <div className="sorting-panel__range">
                <span className="sorting-panel__range-label sorting-panel__range-label--left">Left</span>
                <span className="sorting-panel__range-value">
                  [{leftRange[0]}..{leftRange[1]}]
                </span>
              </div>
            )}
            {rightRange && (
              <div className="sorting-panel__range">
                <span className="sorting-panel__range-label sorting-panel__range-label--right">Right</span>
                <span className="sorting-panel__range-value">
                  [{rightRange[0]}..{rightRange[1]}]
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ---- Color legend ----

function SortingLegend({ isMergeSort }) {
  return (
    <div className="sorting-panel__legend">
      <div className="sorting-panel__legend-item">
        <div className="sorting-panel__legend-swatch" style={{ background: 'var(--accent-cyan)' }} />
        Comparing
      </div>
      {!isMergeSort && (
        <div className="sorting-panel__legend-item">
          <div className="sorting-panel__legend-swatch" style={{ background: 'var(--accent-coral)' }} />
          Key
        </div>
      )}
      {isMergeSort && (
        <div className="sorting-panel__legend-item">
          <div className="sorting-panel__legend-swatch" style={{ background: 'var(--accent-amber)' }} />
          Merged
        </div>
      )}
      <div className="sorting-panel__legend-item">
        <div className="sorting-panel__legend-swatch" style={{ background: 'var(--sage-500)' }} />
        Sorted
      </div>
      <div className="sorting-panel__legend-item">
        <div className="sorting-panel__legend-swatch" style={{ background: 'var(--slate-400)' }} />
        Active Range
      </div>
    </div>
  );
}
