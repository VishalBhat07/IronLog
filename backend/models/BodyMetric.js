const mongoose = require('mongoose');

const BodyMetricSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    weightKg: {
      type: Number,
      required: true
    },

    bodyFatPercent: {
      type: Number
    },

    recordedAt: {
      type: Date,
      default: Date.now
    }
  },
  { versionKey: false }
);

// Index for plotting weight over time efficiently
BodyMetricSchema.index({ userId: 1, recordedAt: -1 });

module.exports = mongoose.model('BodyMetric', BodyMetricSchema);
