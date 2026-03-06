const mongoose = require('mongoose');

// Schema for a graph that a user builds in the canvas.
// Each graph captures the full state: nodes, edges, and metadata.
// This is also the foundation for recording algorithm execution steps later on.

const nodeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },          // client-side identifier (e.g. "node-1")
    label: { type: String, default: '' },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  { _id: false, id: false }   // disable both _id and the virtual 'id' getter
);

const edgeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },          // client-side identifier (e.g. "edge-1")
    source: { type: String, required: true },      // node id of source
    target: { type: String, required: true },      // node id of target
    weight: { type: Number, default: 1 },
    directed: { type: Boolean, default: false },
  },
  { _id: false, id: false }
);

const graphSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      default: 'Untitled Graph',
      trim: true,
    },
    category: {
      type: String,
      enum: ['path-finding', 'sorting', 'trees', 'dynamic-programming', 'optimization', 'other'],
      default: 'path-finding',
    },
    nodes: [nodeSchema],
    edges: [edgeSchema],

    // optional: users can mark start/end for pathfinding
    startNode: { type: String, default: null },
    endNode: { type: String, default: null },

    // placeholder for future execution history recording
    // each entry would store the algorithm name + its step snapshots
    executionHistory: [
      {
        algorithm: { type: String },
        steps: { type: mongoose.Schema.Types.Mixed },
        executedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Graph', graphSchema);
