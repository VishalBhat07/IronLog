const WorkoutSession = require('../models/WorkoutSession');

// Start a new workout
exports.startWorkout = async (req, res) => {
  try {
    const { type, notes } = req.body;
    const session = new WorkoutSession({
      userId: req.user.id, // from authMiddleware
      type: type || 'strength',
      startedAt: new Date(),
      notes: notes || '',
      exercises: []
    });

    await session.save();
    
    res.status(201).json({
      success: true,
      workoutId: session._id,
      startedAt: session.startedAt,
      session
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error starting workout', error: error.message });
  }
};

// Add Exercise to Workout
exports.addExercise = async (req, res) => {
  try {
    const { workoutId } = req.params;
    const { name, target } = req.body;

    const session = await WorkoutSession.findOne({ _id: workoutId, userId: req.user.id });
    if (!session) return res.status(404).json({ success: false, message: 'Workout not found' });

    // Check if exercise already exists, maybe implied? Or always add new block?
    // User requirement: "Add Exercise to Workout"
    // We usually append a new exercise block.
    
    session.exercises.push({ name, target, sets: [] });
    await session.save();

    // Get the added exercise (last one)
    const addedExercise = session.exercises[session.exercises.length - 1];

    res.status(201).json({
      success: true,
      exerciseId: addedExercise._id,
      exercise: addedExercise
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding exercise', error: error.message });
  }
};

// Add Set to Exercise
exports.addSet = async (req, res) => {
  try {
    const { workoutId, exerciseId } = req.params;
    const { reps, weight } = req.body;

    const session = await WorkoutSession.findOne({ _id: workoutId, userId: req.user.id });
    if (!session) return res.status(404).json({ success: false, message: 'Workout not found' });

    const exercise = session.exercises.id(exerciseId);
    if (!exercise) return res.status(404).json({ success: false, message: 'Exercise not found in this workout' });

    exercise.sets.push({ reps, weight, completed: true });
    await session.save();

    const addedSet = exercise.sets[exercise.sets.length - 1];

    res.status(201).json({
      success: true,
      setId: addedSet._id,
      set: addedSet
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding set', error: error.message });
  }
};

// Finish Workout
exports.finishWorkout = async (req, res) => {
  try {
    const { workoutId } = req.params;
    const { notes } = req.body; // allow updating notes at end

    const session = await WorkoutSession.findOne({ _id: workoutId, userId: req.user.id });
    if (!session) return res.status(404).json({ success: false, message: 'Workout not found' });

    if (session.endedAt) return res.status(400).json({ success: false, message: 'Workout already finished' });

    session.endedAt = new Date();
    if (notes) session.notes = notes;
    
    await session.save();

    res.status(200).json({
      success: true,
      message: 'Workout finished',
      durationMinutes: Math.round((session.endedAt - session.startedAt) / 60000),
      session
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error finishing workout', error: error.message });
  }
};

// Get Workout History
exports.getHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const history = await WorkoutSession.find({ userId: req.user.id, endedAt: { $exists: true } })
      .sort({ startedAt: -1 })
      .limit(limit);

    res.status(200).json({ success: true, count: history.length, workouts: history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching history', error: error.message });
  }
};

// Get specific workout (for resuming active or viewing details)
exports.getWorkout = async (req, res) => {
    try {
        const { workoutId } = req.params;
        const session = await WorkoutSession.findOne({ _id: workoutId, userId: req.user.id });
        if (!session) return res.status(404).json({ success: false, message: 'Workout not found' });
        
        res.status(200).json({ success: true, workout: session });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching workout', error: error.message });
    }
}
