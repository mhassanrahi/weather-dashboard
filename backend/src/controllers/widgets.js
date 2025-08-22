const Widget = require('../models/Widget');

/**
 * Get all widgets
 * GET /widgets
 */
const getWidgets = async (req, res, next) => {
  try {
    const widgets = await Widget.find()
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .select('_id location createdAt');
    
    res.json(widgets);
  } catch (error) {
    console.error('Error fetching widgets:', error);
    next(error);
  }
};

/**
 * Create a new widget
 * POST /widgets
 * Body: { location: "Berlin" }
 */
const createWidget = async (req, res, next) => {
  try {
    const { location } = req.body;
    
    // Validate input
    if (!location || typeof location !== 'string' || !location.trim()) {
      return res.status(400).json({
        error: 'Location is required and must be a non-empty string'
      });
    }
    
    // Normalize location name
    const normalizedLocation = Widget.normalizeLocation(location);
    
    if (!normalizedLocation) {
      return res.status(400).json({
        error: 'Invalid location name'
      });
    }
    
    // Check if widget already exists (case-insensitive)
    const existingWidget = await Widget.findOne({ 
      location: normalizedLocation 
    }).collation({ locale: 'en', strength: 2 });
    
    if (existingWidget) {
      return res.status(409).json({
        error: 'Widget already exists'
      });
    }
    
    // Create new widget
    const widget = new Widget({
      location: normalizedLocation
    });
    
    const savedWidget = await widget.save();
    
    res.status(201).json({
      _id: savedWidget._id,
      location: savedWidget.location,
      createdAt: savedWidget.createdAt
    });
    
  } catch (error) {
    if (error.code === 11000) {
      // MongoDB duplicate key error
      return res.status(409).json({
        error: 'Widget already exists'
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: error.message
      });
    }
    
    console.error('Error creating widget:', error);
    next(error);
  }
};

/**
 * Delete a widget by ID
 * DELETE /widgets/:id
 */
const deleteWidget = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid widget ID format'
      });
    }
    
    const deletedWidget = await Widget.findByIdAndDelete(id);
    
    if (!deletedWidget) {
      return res.status(404).json({
        error: 'Widget not found'
      });
    }
    
    res.status(204).send(); // No content response
    
  } catch (error) {
    console.error('Error deleting widget:', error);
    next(error);
  }
};

/**
 * Get a single widget by ID
 * GET /widgets/:id
 */
const getWidget = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid widget ID format'
      });
    }
    
    const widget = await Widget.findById(id)
      .select('_id location createdAt');
    
    if (!widget) {
      return res.status(404).json({
        error: 'Widget not found'
      });
    }
    
    res.json(widget);
    
  } catch (error) {
    console.error('Error fetching widget:', error);
    next(error);
  }
};

module.exports = {
  getWidgets,
  createWidget,
  deleteWidget,
  getWidget
};
