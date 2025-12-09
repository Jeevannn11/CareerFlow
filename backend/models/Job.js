const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    // NEW: Link this job to a specific user
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    company: { type: String, required: true },
    position: { type: String, required: true },
    location: { type: String, default: '' },
    salary: { type: String, default: '' },
    status: { 
        type: String, 
        enum: ['applied', 'ot', 'interview', 'offer', 'rejected'], 
        default: 'applied' 
    },
    jobType: { type: String, default: 'Full-time' },
    remote: { type: String, default: 'On-site' },
    contactPerson: { type: String, default: '' },
    notes: { type: String, default: '' },
    url: { type: String, default: '' },
    appliedDate: { type: Date, default: Date.now },
    deadline: { type: Date },
    nextRoundDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);