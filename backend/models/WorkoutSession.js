const mongoose = require('mongoose');

const SetSchema = new mongoose.Schema(
  {
    reps: { type: Number, required: true },
    weight: { type: Number, required: true } // kg
  },
  { _id: false }
);

const ExerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    muscleGroup: { type: String }, // optional
    sets: { type: [SetSchema], required: true }
  },
  { _id: false }
);

const WorkoutSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    type: {
      type: String,
      enum: ["strength", "cardio", "mixed"],
      default: "strength"
    },

    exercises: {
      type: [ExerciseSchema],
      default: []
    },

    cardio: {
      type: {
        type: String // treadmill, cycling, etc.
      },
      durationMinutes: Number,
      distanceKm: Number,
      calories: Number
    },

    startedAt: {
      type: Date,
      required: true
    },

    endedAt: {
      type: Date
    },

    notes: {
      type: String
    }
  },
  { timestamps: true }
);

// Index for fetching recent workouts fast
WorkoutSessionSchema.index({ userId: 1, startedAt: -1 });

module.exports = mongoose.model('WorkoutSession', WorkoutSessionSchema);
