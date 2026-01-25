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
        if (weight) user.weight = weight;
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
