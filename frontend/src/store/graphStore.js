import { create } from 'zustand';

/*
  Graph store -- manages the nodes, edges, and selection state for the canvas.

  This is the single source of truth for the graph the user is building.
  The canvas component reads from here and dispatches actions back.

  Node shape:
    { id: string, label: string, x: number, y: number, type?: 'start' | 'end' | 'default' }

  Edge shape:
    { id: string, source: string, target: string, weight: number, directed: boolean }
*/

let nodeCounter = 0;
let edgeCounter = 0;

const useGraphStore = create((set, get) => ({
  nodes: [],
  edges: [],
  startNodeId: null,
  endNodeId: null,

  // weighted vs unweighted mode
  weighted: false,
  directed: false,

  // currently selected element (for deletion, editing, etc.)
  selectedNodeId: null,
  selectedEdgeId: null,

  // ---- Node actions ----

  addNode: (x, y, label) => {
    const id = `node-${++nodeCounter}`;
    set((state) => ({
      nodes: [...state.nodes, { id, label: label || id, x, y }],
    }));
    return id;
  },

  removeNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      startNodeId: state.startNodeId === nodeId ? null : state.startNodeId,
      endNodeId: state.endNodeId === nodeId ? null : state.endNodeId,
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
    }));
  },

  updateNodePosition: (nodeId, x, y) => {
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === nodeId ? { ...n, x, y } : n)),
    }));
  },

  setStartNode: (nodeId) => set({ startNodeId: nodeId }),
  setEndNode: (nodeId) => set({ endNodeId: nodeId }),

  // ---- Edge actions ----

  addEdge: (source, target, weight = 1) => {
    // prevent duplicate edges
    const existing = get().edges.find(
      (e) => (e.source === source && e.target === target) || (!get().directed && e.source === target && e.target === source)
    );
    if (existing || source === target) return null;

    const id = `edge-${++edgeCounter}`;
    set((state) => ({
      edges: [...state.edges, { id, source, target, weight, directed: state.directed }],
    }));
    return id;
  },

  removeEdge: (edgeId) => {
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== edgeId),
      selectedEdgeId: state.selectedEdgeId === edgeId ? null : state.selectedEdgeId,
    }));
  },

  updateEdgeWeight: (edgeId, weight) => {
    set((state) => ({
      edges: state.edges.map((e) => (e.id === edgeId ? { ...e, weight } : e)),
    }));
  },

  // ---- Selection ----

  selectNode: (nodeId) => set({ selectedNodeId: nodeId, selectedEdgeId: null }),
  selectEdge: (edgeId) => set({ selectedEdgeId: edgeId, selectedNodeId: null }),
  clearSelection: () => set({ selectedNodeId: null, selectedEdgeId: null }),

  // ---- Settings ----
  setWeighted: (val) => set({ weighted: val }),
  setDirected: (val) => set({ directed: val }),

  // ---- Bulk operations ----

  clearGraph: () => {
    nodeCounter = 0;
    edgeCounter = 0;
    set({
      nodes: [],
      edges: [],
      startNodeId: null,
      endNodeId: null,
      selectedNodeId: null,
      selectedEdgeId: null,
    });
  },

  // Load a saved graph (from backend or preset)
  loadGraph: (graphData) => {
    nodeCounter = graphData.nodes.length;
    edgeCounter = graphData.edges.length;
    set({
      nodes: graphData.nodes,
      edges: graphData.edges,
      startNodeId: graphData.startNodeId || null,
      endNodeId: graphData.endNodeId || null,
      selectedNodeId: null,
      selectedEdgeId: null,
    });
  },

  // Build adjacency list from edges (used by algorithms)
  getAdjacencyList: () => {
    const { nodes, edges, directed } = get();
    const adj = {};
    nodes.forEach((n) => {
      adj[n.id] = [];
    });
    edges.forEach((e) => {
      adj[e.source].push({ node: e.target, weight: e.weight });
      if (!directed) {
        adj[e.target].push({ node: e.source, weight: e.weight });
      }
    });
    return adj;
  },
}));

export default useGraphStore;
