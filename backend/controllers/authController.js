const User = require('../models/User');
const WorkoutSession = require('../models/WorkoutSession');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    try {
        // Accept 'name' as per new schema, but fallback to 'username' if sent
        const { name, username, email, password } = req.body;
        const displayName = name || username;

        if (!displayName || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email and password' });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password explicitly
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        user = new User({
            name: displayName,
            email,
            passwordHash
        });

        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ token });
            }
        );
    } catch (err) {
        console.error('Register Error:', err);
        res.status(500).send('Server Error: ' + err.message);
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Match password (using the method defined in User model)
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.status(200).json({ token });
            }
        );
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).send('Server Error: ' + err.message);
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash'); // Exclude passwordHash
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update Profile
exports.updateProfile = async (req, res) => {
    try {
        const { bio, height, weight, gender, goals, name, profileImage } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (bio !== undefined) user.bio = bio;
        if (height) user.height = height;
        if (weight) {
            // Push to history if weight is different or new entry desired? 
            // Let's push every update for granularity
            user.weight = weight;
            user.weightHistory.push({ weight: weight, date: new Date() });
        }
        if (gender) user.gender = gender;
        if (goals) user.goals = goals;
        if (profileImage !== undefined) user.profileImage = profileImage;

        await user.save();
        
        res.json({ success: true, user: await User.findById(req.user.id).select('-passwordHash') });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Clear All Data (Workouts, Metrics) but keep Account
exports.clearData = async (req, res) => {
    try {
        await WorkoutSession.deleteMany({ userId: req.user.id });
        // await BodyMetric.deleteMany({ userId: req.user.id }); // If we had it active
        res.json({ success: true, message: 'All workout data cleared' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete Account
exports.deleteAccount = async (req, res) => {
    try {
        await WorkoutSession.deleteMany({ userId: req.user.id });
        // await BodyMetric.deleteMany({ userId: req.user.id });
        await User.findByIdAndDelete(req.user.id);
        res.json({ success: true, message: 'Account deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
const seedData = [
  // Original
  { date: '2025-08-18', weight: 57.4 },
  { date: '2025-08-19', weight: 57.65 },
  { date: '2025-08-20', weight: 57.5 },
  { date: '2025-08-21', weight: 57.7 },
  { date: '2025-08-22', weight: 58.05 },
  { date: '2025-08-23', weight: 58.45 },
  { date: '2025-08-24', weight: 58.85 },
  { date: '2025-08-25', weight: 58.5 },
  { date: '2025-08-26', weight: 58.2 },
  { date: '2025-08-27', weight: 58.4 },
  { date: '2025-08-28', weight: 58.1 },
  { date: '2025-08-29', weight: 58.4 },
  { date: '2025-08-30', weight: 58.1 },
  { date: '2025-08-31', weight: 58.55 },
  { date: '2025-09-01', weight: 58.55 },
  { date: '2025-09-02', weight: 58.55 },
  
  // From Images (Extracted) - Sep
  { date: '2025-09-05', weight: 58.7 },
  { date: '2025-09-06', weight: 59.3 },
  { date: '2025-09-07', weight: 59.9 },
  { date: '2025-09-08', weight: 59.55 },
  { date: '2025-09-09', weight: 59.85 },
  { date: '2025-09-12', weight: 59.1 },
  { date: '2025-09-13', weight: 58.1 },
  { date: '2025-09-15', weight: 58.9 },
  { date: '2025-09-16', weight: 58.7 },
  { date: '2025-09-17', weight: 58.5 },
  { date: '2025-09-18', weight: 58.3 },
  { date: '2025-09-19', weight: 58.7 },
  { date: '2025-09-22', weight: 58.7 },
  { date: '2025-09-23', weight: 59.5 },
  { date: '2025-09-24', weight: 59.0 },
  { date: '2025-09-25', weight: 59.1 },
  { date: '2025-09-26', weight: 58.9 },
  
  // Oct
  { date: '2025-10-03', weight: 59.7 },
  { date: '2025-10-06', weight: 59.7 },
  { date: '2025-10-07', weight: 60.05 },
  { date: '2025-10-08', weight: 59.95 },
  { date: '2025-10-09', weight: 60.65 },
  { date: '2025-10-10', weight: 60.35 },
  { date: '2025-10-11', weight: 61.15 },
  { date: '2025-10-13', weight: 60.85 },
  { date: '2025-10-14', weight: 61.35 },
  { date: '2025-10-15', weight: 59.6 },
  { date: '2025-10-16', weight: 60.3 },
  { date: '2025-10-17', weight: 60.3 },
  { date: '2025-10-19', weight: 60.65 },
  { date: '2025-10-20', weight: 60.65 },
  { date: '2025-10-21', weight: 60.65 },
  { date: '2025-10-22', weight: 60.15 },
  { date: '2025-10-23', weight: 60.35 },
  { date: '2025-10-24', weight: 60.65 },
  { date: '2025-10-26', weight: 60.6 },
  { date: '2025-10-27', weight: 60.6 },
  { date: '2025-10-29', weight: 60.6 },
  { date: '2025-10-30', weight: 61.6 },
  { date: '2025-10-31', weight: 60.6 },
  
  // Nov
  { date: '2025-11-02', weight: 61.25 },
  { date: '2025-11-11', weight: 61.3 },
  { date: '2025-11-13', weight: 61.3 },
  { date: '2025-11-14', weight: 61.45 },
  { date: '2025-11-15', weight: 61.45 },
  
  // Dec
  { date: '2025-12-25', weight: 60.5 }
];

exports.seedWeights = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        // Map seed data to format
        const history = seedData.map(d => ({
            weight: d.weight,
            date: new Date(d.date)
        }));
        
        // Merge or replace? Let's append if not exists, or just replace for this demo request
        // To be safe, let's just add them
        user.weightHistory = [...(user.weightHistory || []), ...history];
        
        // Sort
        user.weightHistory.sort((a,b) => new Date(a.date) - new Date(b.date));
        
        // Update current weight to latest
        user.weight = 61.45; 
        
        await user.save();
        res.json({ success: true, count: user.weightHistory.length });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error seeding');
    }
};
