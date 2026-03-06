import { useState, useCallback, useRef, useEffect } from 'react';
import useGraphStore from '../../store/graphStore';
import useVisualizationStore from '../../store/visualizationStore';
import './GraphCanvas.css';

/*
  GraphCanvas -- the main interactive area where users build and visualize graphs.

  Interactions:
    - Double-click on empty space -> create a node
    - Click a node -> select it
    - Click a node then click another -> create an edge (when in "connect" mode: hold Shift)
    - Drag a node -> move it
    - Press Delete/Backspace -> delete selected node or edge
    - Right-click a node -> context options (set as start/end)

  During visualization playback, the canvas becomes read-only and nodes
  get colored according to the algorithm's current state.
*/

export default function GraphCanvas() {
  const {
    nodes, edges, startNodeId, endNodeId, weighted,
    addNode, removeNode, updateNodePosition,
    addEdge, removeEdge,
    selectedNodeId, selectedEdgeId,
    selectNode, selectEdge, clearSelection,
    setStartNode, setEndNode, directed,
  } = useGraphStore();

  const { visualState, isPlaying, steps } = useVisualizationStore();
  const isVisualizationActive = steps.length > 0;

  const canvasRef = useRef(null);
  const [dragging, setDragging] = useState(null);          // { nodeId, offsetX, offsetY }
  const [connecting, setConnecting] = useState(null);       // { sourceId, mouseX, mouseY }
  const [contextMenu, setContextMenu] = useState(null);     // { nodeId, x, y }
  const [weightInput, setWeightInput] = useState(null);     // { sourceId, targetId, x, y }
  const [weightValue, setWeightValue] = useState('1');

  // close context menu on click anywhere
  useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  // keyboard handler for deletion
  useEffect(() => {
    const handleKey = (e) => {
      if (isVisualizationActive) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) removeNode(selectedNodeId);
        if (selectedEdgeId) removeEdge(selectedEdgeId);
      }
      if (e.key === 'Escape') {
        clearSelection();
        setConnecting(null);
        setContextMenu(null);
        setWeightInput(null);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedNodeId, selectedEdgeId, isVisualizationActive, removeNode, removeEdge, clearSelection]);

  // double-click on canvas -> add node
  const handleCanvasDoubleClick = useCallback((e) => {
    if (isVisualizationActive) return;
    if (e.target !== canvasRef.current && !e.target.classList.contains('graph-canvas__grid')) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addNode(x, y);
  }, [addNode, isVisualizationActive]);

  // canvas click -> clear selection
  const handleCanvasClick = useCallback((e) => {
    if (e.target === canvasRef.current || e.target.classList.contains('graph-canvas__grid')) {
      if (connecting) {
        setConnecting(null);
        return;
      }
      clearSelection();
    }
  }, [clearSelection, connecting]);

  // ---- Node interactions ----

  const handleNodeMouseDown = useCallback((e, nodeId) => {
    e.stopPropagation();
    if (isVisualizationActive) return;

    // shift+click: start or finish a connection
    if (e.shiftKey || connecting) {
      if (connecting) {
        // finish connection
        if (connecting.sourceId !== nodeId) {
          if (weighted) {
            // show weight input popup
            setWeightInput({
              sourceId: connecting.sourceId,
              targetId: nodeId,
              x: e.clientX,
              y: e.clientY,
            });
          } else {
            addEdge(connecting.sourceId, nodeId);
          }
        }
        setConnecting(null);
      } else {
        // start connection
        const rect = canvasRef.current.getBoundingClientRect();
        setConnecting({ sourceId: nodeId, mouseX: e.clientX - rect.left, mouseY: e.clientY - rect.top });
      }
      return;
    }

    // regular click: select node and begin drag
    selectNode(nodeId);

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - node.x;
    const offsetY = e.clientY - rect.top - node.y;
    setDragging({ nodeId, offsetX, offsetY });
  }, [isVisualizationActive, connecting, nodes, selectNode, addEdge, weighted]);

  // mouse move for dragging nodes and drawing connection line
  const handleCanvasMouseMove = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (dragging) {
      const x = mx - dragging.offsetX;
      const y = my - dragging.offsetY;
      updateNodePosition(dragging.nodeId, x, y);
    }

    if (connecting) {
      setConnecting((prev) => prev ? { ...prev, mouseX: mx, mouseY: my } : null);
    }
  }, [dragging, connecting, updateNodePosition]);

  const handleCanvasMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  // right-click context menu for a node
  const handleNodeContextMenu = useCallback((e, nodeId) => {
    e.preventDefault();
    e.stopPropagation();
    if (isVisualizationActive) return;
    setContextMenu({ nodeId, x: e.clientX, y: e.clientY });
  }, [isVisualizationActive]);

  // edge click -> select edge
  const handleEdgeClick = useCallback((e, edgeId) => {
    e.stopPropagation();
    if (isVisualizationActive) return;
    selectEdge(edgeId);
  }, [selectEdge, isVisualizationActive]);

  // weight input submit
  const handleWeightSubmit = useCallback(() => {
    if (weightInput) {
      const w = parseFloat(weightValue) || 1;
      addEdge(weightInput.sourceId, weightInput.targetId, w);
      setWeightInput(null);
      setWeightValue('1');
    }
  }, [weightInput, weightValue, addEdge]);

  // determine the CSS class for a node based on visualization state
  const getNodeClass = (nodeId) => {
    const classes = ['graph-node'];

    if (nodeId === selectedNodeId) classes.push('graph-node--selected');
    if (nodeId === startNodeId) classes.push('graph-node--start');
    if (nodeId === endNodeId) classes.push('graph-node--end');

    // during visualization, overlay algorithm state classes
    if (isVisualizationActive && visualState) {
      if (visualState.path?.includes(nodeId)) {
        classes.push('graph-node--path');
      } else if (nodeId === visualState.currentNode) {
        classes.push('graph-node--current');
      } else if (visualState.visitedNodes?.includes(nodeId)) {
        classes.push('graph-node--visited');
      } else if (visualState.queuedNodes?.includes(nodeId)) {
        classes.push('graph-node--queued');
      }
    }

    return classes.join(' ');
  };

  // determine edge class based on visualization state
  const getEdgeClass = (edge) => {
    const classes = ['graph-edge'];
    if (edge.id === selectedEdgeId) classes.push('graph-edge--selected');

    if (isVisualizationActive && visualState) {
      // check if this edge is part of the final path
      const path = visualState.path || [];
      for (let i = 0; i < path.length - 1; i++) {
        if (
          (path[i] === edge.source && path[i + 1] === edge.target) ||
          (path[i] === edge.target && path[i + 1] === edge.source)
        ) {
          classes.push('graph-edge--path');
          return classes.join(' ');
        }
      }
      // check if this edge has been explored
      const explored = visualState.exploredEdges || [];
      for (const ex of explored) {
        if (
          (ex.source === edge.source && ex.target === edge.target) ||
          (ex.source === edge.target && ex.target === edge.source)
        ) {
          classes.push('graph-edge--explored');
          break;
        }
      }
    }

    return classes.join(' ');
  };

  // get node display label (short)
  const getNodeDisplayLabel = (node) => {
    // show just the number part for cleanliness
    const num = node.id.replace('node-', '');
    return num;
  };

  return (
    <div
      ref={canvasRef}
      className="graph-canvas"
      onDoubleClick={handleCanvasDoubleClick}
      onClick={handleCanvasClick}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
    >
      <div className="graph-canvas__grid" />

      {/* empty state hint */}
      {nodes.length === 0 && (
        <div className="graph-canvas__hint">
          <h3>Build Your Graph</h3>
          <p>
            <kbd>Double-click</kbd> to add a node<br />
            <kbd>Shift + Click</kbd> two nodes to connect them<br />
            <kbd>Right-click</kbd> a node to set start/end<br />
            <kbd>Delete</kbd> to remove selected element
          </p>
        </div>
      )}

      {/* SVG layer for edges */}
      <svg className="graph-canvas__svg">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="8"
            refX="9"
            refY="4"
            orient="auto"
          >
            <polygon points="0 0, 10 4, 0 8" className="graph-canvas__arrowhead" />
          </marker>
        </defs>

        {edges.map((edge) => {
          const sourceNode = nodes.find((n) => n.id === edge.source);
          const targetNode = nodes.find((n) => n.id === edge.target);
          if (!sourceNode || !targetNode) return null;

          // offset the line endpoints to the edge of the node circles (radius 22px)
          const dx = targetNode.x - sourceNode.x;
          const dy = targetNode.y - sourceNode.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const nodeRadius = 22;
          const sx = sourceNode.x + (dx / dist) * nodeRadius;
          const sy = sourceNode.y + (dy / dist) * nodeRadius;
          const tx = targetNode.x - (dx / dist) * nodeRadius;
          const ty = targetNode.y - (dy / dist) * nodeRadius;

          const midX = (sourceNode.x + targetNode.x) / 2;
          const midY = (sourceNode.y + targetNode.y) / 2;

          return (
            <g key={edge.id}>
              <line
                x1={sx} y1={sy}
                x2={tx} y2={ty}
                className={getEdgeClass(edge)}
                onClick={(e) => handleEdgeClick(e, edge.id)}
                markerEnd={directed ? 'url(#arrowhead)' : undefined}
              />
              {weighted && (
                <text
                  x={midX}
                  y={midY - 8}
                  textAnchor="middle"
                  className="graph-edge__weight"
                >
                  {edge.weight}
                </text>
              )}
            </g>
          );
        })}

        {/* connection line while user is dragging to create an edge */}
        {connecting && (() => {
          const sourceNode = nodes.find((n) => n.id === connecting.sourceId);
          if (!sourceNode) return null;
          return (
            <line
              x1={sourceNode.x} y1={sourceNode.y}
              x2={connecting.mouseX} y2={connecting.mouseY}
              className="graph-canvas__connection-line"
            />
          );
        })()}
      </svg>

      {/* Node elements */}
      {nodes.map((node) => (
        <div
          key={node.id}
          className={getNodeClass(node.id)}
          style={{ left: node.x, top: node.y }}
          onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
          onContextMenu={(e) => handleNodeContextMenu(e, node.id)}
        >
          {getNodeDisplayLabel(node)}
          <span className="graph-node__label">{node.label}</span>
        </div>
      ))}

      {/* Context menu */}
      {contextMenu && (
        <div
          className="context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="context-menu__item"
            onClick={() => { setStartNode(contextMenu.nodeId); setContextMenu(null); }}
          >
            Set as Start
          </button>
          <button
            className="context-menu__item"
            onClick={() => { setEndNode(contextMenu.nodeId); setContextMenu(null); }}
          >
            Set as End
          </button>
          <div className="context-menu__divider" />
          <button
            className="context-menu__item context-menu__item--danger"
            onClick={() => { removeNode(contextMenu.nodeId); setContextMenu(null); }}
          >
            Delete Node
          </button>
        </div>
      )}

      {/* Weight input popup */}
      {weightInput && (
        <div
          className="weight-input-popup"
          style={{ left: weightInput.x, top: weightInput.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <label>Edge weight:</label>
          <input
            type="number"
            value={weightValue}
            onChange={(e) => setWeightValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleWeightSubmit(); }}
            autoFocus
          />
          <button onClick={handleWeightSubmit}>OK</button>
        </div>
      )}
    </div>
  );
}
