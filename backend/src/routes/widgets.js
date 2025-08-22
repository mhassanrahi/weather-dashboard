const express = require('express');
const {
  getWidgets,
  createWidget,
  deleteWidget,
  getWidget
} = require('../controllers/widgets');

const router = express.Router();

/**
 * Widget Routes
 * Base path: /widgets
 */

// GET /widgets - Get all widgets
router.get('/', getWidgets);

// POST /widgets - Create a new widget
router.post('/', createWidget);

// GET /widgets/:id - Get a single widget by ID
router.get('/:id', getWidget);

// DELETE /widgets/:id - Delete a widget by ID
router.delete('/:id', deleteWidget);

module.exports = router;
