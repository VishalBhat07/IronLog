const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');
const authMiddleware = require('../middleware/auth');

// Protect all workout routes
router.use(authMiddleware);

router.post('/start', workoutController.startWorkout);
router.post('/:workoutId/exercises', workoutController.addExercise);
router.post('/:workoutId/exercises/:exerciseId/sets', workoutController.addSet);
router.post('/:workoutId/finish', workoutController.finishWorkout);
router.get('/', workoutController.getHistory); // ?limit=10
router.get('/active', workoutController.getActive); // Must be before :workoutId
router.get('/:workoutId', workoutController.getWorkout);

module.exports = router;
