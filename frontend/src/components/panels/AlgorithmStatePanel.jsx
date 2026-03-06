import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useVisualizationStore from '../../store/visualizationStore';
import './AlgorithmStatePanel.css';

/*
  AlgorithmStatePanel -- the right-side panel that shows the algorithm's
  internal state during visualization playback.

  Displays:
    - Current step description (what the algorithm is doing right now)
    - The data structure contents (queue for BFS, stack for DFS)
    - Visited nodes set
    - Discovered path (if found)
    - Parent/predecessor map (shows how we got to each node)
    - Color legend
*/

// small helper to strip the "node-" prefix for display
const shortId = (id) => (id ? id.replace('node-', '') : '');

export default function AlgorithmStatePanel() {
  const {
    steps, currentStepIndex, algorithmName, visualState,
  } = useVisualizationStore();

  const isActive = steps.length > 0;

  // figure out whether this algorithm uses a queue or stack
  const isDFS = algorithmName?.toLowerCase().includes('depth');
  const dsLabel = isDFS ? 'Stack' : 'Queue';

  // the current step's data structure contents
  const dsItems = visualState.dataStructure || [];
  const visitedNodes = visualState.visitedNodes || [];
  const path = visualState.path || [];
  const parentMap = visualState.parentMap || {};

  // sort parent entries for consistent display
  const parentEntries = useMemo(() => {
    return Object.entries(parentMap)
      .filter(([_, parent]) => parent !== null)
      .sort(([a], [b]) => a.localeCompare(b));
  }, [parentMap]);

  if (!isActive) {
    return (
      <aside className="state-panel">
        <div className="state-panel__empty">
          <h4>Algorithm State</h4>
          <p>
            Build a graph, set start and end nodes,
            then run an algorithm to see its internal
            state displayed here step by step.
          </p>
        </div>

        {/* legend is always useful */}
        <Legend />
      </aside>
    );
  }

  return (
    <aside className="state-panel">
      {/* header */}
      <div className="state-panel__header">
        <div className="state-panel__title">Algorithm State</div>
        <div className="state-panel__algo-name">{algorithmName}</div>
      </div>

      {/* step description */}
      <div className="state-panel__description">
        {visualState.description || 'Waiting...'}
      </div>

      {/* data structure (queue/stack) */}
      <div className="state-panel__section">
        <div className="state-panel__section-title">
          {dsLabel}
          <span className="state-panel__section-count">{dsItems.length}</span>
        </div>
        <div className="state-panel__ds">
          {dsItems.length === 0 ? (
            <span className="state-panel__ds-empty">Empty</span>
          ) : (
            <AnimatePresence mode="popLayout">
              {dsItems.map((item, idx) => (
                <motion.div
                  key={item + '-' + idx}
                  className={`state-panel__ds-item ${
                    idx === 0 ? 'state-panel__ds-item--front' : ''
                  } ${idx === dsItems.length - 1 && dsItems.length > 1 ? 'state-panel__ds-item--back' : ''}`}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                  layout
                >
                  {shortId(item)}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
        {dsItems.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span className="state-panel__ds-label">
              {isDFS ? 'Top' : 'Front'}
            </span>
            {dsItems.length > 1 && (
              <span className="state-panel__ds-label">
                {isDFS ? 'Bottom' : 'Back'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* visited nodes */}
      <div className="state-panel__section">
        <div className="state-panel__section-title">
          Visited
          <span className="state-panel__section-count">{visitedNodes.length}</span>
        </div>
        <div className="state-panel__visited">
          <AnimatePresence>
            {visitedNodes.map((nodeId) => (
              <motion.div
                key={nodeId}
                className="state-panel__visited-node"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.15 }}
              >
                {shortId(nodeId)}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* path (if found) */}
      {path.length > 0 && (
        <div className="state-panel__section">
          <div className="state-panel__section-title">
            Path Found
            <span className="state-panel__section-count">{path.length} nodes</span>
          </div>
          <div className="state-panel__path">
            {path.map((nodeId, idx) => (
              <motion.div
                key={nodeId}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
              >
                <div className="state-panel__path-node">{shortId(nodeId)}</div>
                {idx < path.length - 1 && (
                  <span className="state-panel__path-arrow">&#8594;</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* parent map */}
      {parentEntries.length > 0 && (
        <div className="state-panel__section">
          <div className="state-panel__section-title">Parent Map</div>
          <div className="state-panel__parent-map">
            {parentEntries.map(([node, parent]) => (
              <div key={node} className="state-panel__parent-entry">
                <span>{shortId(node)}</span>
                <span style={{ color: 'var(--text-muted)' }}>&#8592;</span>
                <span>{shortId(parent)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Legend />
    </aside>
  );
}

function Legend() {
  return (
    <div className="state-panel__legend">
      <div className="state-panel__legend-item">
        <div className="state-panel__legend-dot" style={{ background: 'var(--node-start)' }} />
        Start
      </div>
      <div className="state-panel__legend-item">
        <div className="state-panel__legend-dot" style={{ background: 'var(--node-end)' }} />
        End
      </div>
      <div className="state-panel__legend-item">
        <div className="state-panel__legend-dot" style={{ background: 'var(--node-current)' }} />
        Current
      </div>
      <div className="state-panel__legend-item">
        <div className="state-panel__legend-dot" style={{ background: 'var(--node-queued)' }} />
        Queued
      </div>
      <div className="state-panel__legend-item">
        <div className="state-panel__legend-dot" style={{ background: 'var(--node-visited)' }} />
        Visited
      </div>
      <div className="state-panel__legend-item">
        <div className="state-panel__legend-dot" style={{ background: 'var(--node-path)' }} />
        Path
      </div>
    </div>
  );
}
