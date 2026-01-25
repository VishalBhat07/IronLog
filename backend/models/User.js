const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },

    passwordHash: {
      type: String,
      required: true
    },

    createdAt: {
      type: Date,
      default: Date.now
    },

    // Profile Details
    profileImage: { type: String, default: null },
    bio: { type: String, default: '' },
    height: { type: Number }, // cm
    weight: { type: Number }, // kg
    weightHistory: [{
        weight: Number,
        date: { type: Date, default: Date.now }
    }],
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'], default: 'Prefer not to say' },
    goals: [{ type: String }]
  },
  { versionKey: false }
);

// Method to check password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

module.exports = mongoose.model('User', UserSchema);
