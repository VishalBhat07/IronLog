const seedData = [
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
  { date: '2025-12-20', weight: 61.45 }
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
