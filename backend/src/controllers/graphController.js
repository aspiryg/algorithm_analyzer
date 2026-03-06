const Graph = require('../models/Graph');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// POST /api/graphs -- save a new graph
const createGraph = catchAsync(async (req, res) => {
  const graph = await Graph.create({
    ...req.body,
    user: req.user._id,
  });
  res.status(201).json({ success: true, data: graph });
});

// GET /api/graphs -- get all graphs for the current user
const getMyGraphs = catchAsync(async (req, res) => {
  const graphs = await Graph.find({ user: req.user._id }).sort('-updatedAt');
  res.status(200).json({ success: true, count: graphs.length, data: graphs });
});

// GET /api/graphs/:id
const getGraph = catchAsync(async (req, res, next) => {
  const graph = await Graph.findOne({ _id: req.params.id, user: req.user._id });
  if (!graph) return next(new AppError('Graph not found.', 404));
  res.status(200).json({ success: true, data: graph });
});

// PUT /api/graphs/:id
const updateGraph = catchAsync(async (req, res, next) => {
  const graph = await Graph.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!graph) return next(new AppError('Graph not found.', 404));
  res.status(200).json({ success: true, data: graph });
});

// DELETE /api/graphs/:id
const deleteGraph = catchAsync(async (req, res, next) => {
  const graph = await Graph.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!graph) return next(new AppError('Graph not found.', 404));
  res.status(200).json({ success: true, message: 'Graph deleted.' });
});

module.exports = { createGraph, getMyGraphs, getGraph, updateGraph, deleteGraph };
