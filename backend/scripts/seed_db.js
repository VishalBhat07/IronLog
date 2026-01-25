const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGO_URI = "mongodb+srv://vishalbhat21:0f8VW6LHO8GspJHA@cluster0.feoahhi.mongodb.net/ironlog?retryWrites=true&w=majority";

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

const seed = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const user = await User.findOne({ email: 'vishalbhat21092005@gmail.com' });
        
        if (!user) { console.log('User not found'); process.exit(1); }
        
        const history = seedData.map(d => ({
            weight: d.weight,
            date: new Date(d.date)
        }));
        
        user.weightHistory = history;
        user.weightHistory.sort((a,b) => new Date(a.date) - new Date(b.date));
        
        // Update current weight to latest in the list
        if (history.length > 0) {
            user.weight = history[history.length - 1].weight;
        }

        await user.save();
        console.log(`Seeded ${history.length} weight entries for ${user.name}`);
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

seed();
