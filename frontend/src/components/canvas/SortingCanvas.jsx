import { useMemo } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import useSortingVisualizationStore from '../../store/sortingVisualizationStore';
import './SortingCanvas.css';

/*
  SortingCanvas -- renders the array as animated bar columns.

  Each bar's height is proportional to its value.
  Bars slide horizontally when elements swap positions,
  using Framer Motion's layout animation with identity-based keys.

  Colors indicate the current role of each element:
    - Default (idle)
    - Highlighted (being compared/moved)
    - Sorted (in final position)
    - Merged (placed during a merge operation)
    - Key (the insertion sort key being inserted)
    - Active range (part of the sub-array being processed)
*/

export default function SortingCanvas({ compact = false }) {
  const { visualState, steps, speed } = useSortingVisualizationStore();

  const {
    array,
    elementIds,
    highlightIndices,
    markedSorted,
    mergedIndices,
    activeRange,
    keyIndex,
  } = visualState;

  const isActive = steps.length > 0;

  // Faster speed → faster layout transition
  const layoutDuration = speed < 200 ? 0.1 : speed < 400 ? 0.18 : 0.25;

  const maxValue = useMemo(
    () => Math.max(...array, 1),
    [array]
  );

  if (array.length === 0) {
    return (
      <div className="sorting-canvas sorting-canvas--empty">
        <p>Enter numbers above and click <strong>Run</strong> to visualize.</p>
      </div>
    );
  }

  const barWidthPct = 100 / array.length;

  return (
    <div className={`sorting-canvas ${compact ? 'sorting-canvas--compact' : ''}`}>
      <LayoutGroup>
        <div className="sorting-canvas__bars">
          {array.map((value, idx) => {
            const heightPct = (value / maxValue) * 100;
            const barClass = getBarClass(idx, highlightIndices, markedSorted, mergedIndices, activeRange, keyIndex, isActive);
            // Use the element's original identity as key so Framer Motion
            // animates horizontal position changes instead of morphing heights.
            const elemId = elementIds[idx] ?? idx;

            return (
              <motion.div
                key={`elem-${elemId}`}
                className="sorting-canvas__bar-wrapper"
                style={{ width: `${barWidthPct}%` }}
                layout
                transition={{
                  layout: { type: 'spring', stiffness: 400, damping: 30, duration: layoutDuration },
                }}
              >
                <motion.div
                  className={`sorting-canvas__bar ${barClass}`}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
                {!compact && (
                  <span className="sorting-canvas__bar-label">
                    {value}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </LayoutGroup>

      {/* index rulers */}
      {!compact && (
        <div className="sorting-canvas__indices">
          {array.map((_, idx) => (
            <span
              key={idx}
              className="sorting-canvas__index"
              style={{ width: `${barWidthPct}%` }}
            >
              {idx}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function getBarClass(idx, highlightIndices, markedSorted, mergedIndices, activeRange, keyIndex, isActive) {
  if (!isActive) return '';

  // key being inserted (insertion sort)
  if (keyIndex === idx) return 'sorting-canvas__bar--key';

  // currently being compared or moved
  if (highlightIndices.includes(idx)) return 'sorting-canvas__bar--highlight';

  // placed during merge
  if (mergedIndices.includes(idx)) return 'sorting-canvas__bar--merged';

  // confirmed sorted
  if (markedSorted.includes(idx)) return 'sorting-canvas__bar--sorted';

  // inside the active range but not otherwise highlighted
  if (activeRange && idx >= activeRange[0] && idx <= activeRange[1]) {
    return 'sorting-canvas__bar--active-range';
  }

  return 'sorting-canvas__bar--idle';
}
