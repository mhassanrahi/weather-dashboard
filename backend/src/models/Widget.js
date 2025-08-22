const mongoose = require('mongoose');

/**
 * Widget Schema
 * Represents a weather widget for a specific location
 */
const widgetSchema = new mongoose.Schema(
  {
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      minlength: [1, 'Location cannot be empty'],
      maxlength: [100, 'Location cannot exceed 100 characters'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Add virtual id field and remove __v
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
  }
);

/**
 * Create unique index on location (case-insensitive)
 * This prevents duplicate widgets for the same city
 */
widgetSchema.index(
  { location: 1 },
  {
    unique: true,
    collation: { locale: 'en', strength: 2 }, // Case-insensitive comparison
  }
);

/**
 * Pre-save middleware to normalize location name
 * Converts to title case (e.g., "berlin" -> "Berlin")
 */
widgetSchema.pre('save', function (next) {
  if (this.location) {
    // Normalize to title case: first letter uppercase, rest lowercase
    this.location = this.location
      .trim()
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  next();
});

/**
 * Static method to normalize location names consistently
 */
widgetSchema.statics.normalizeLocation = function (location) {
  if (!location || typeof location !== 'string') {
    return '';
  }

  return location
    .trim()
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Instance method to get formatted creation date
 */
widgetSchema.methods.getFormattedDate = function () {
  return this.createdAt.toISOString();
};

const Widget = mongoose.model('Widget', widgetSchema);

module.exports = Widget;
