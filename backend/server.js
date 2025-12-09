require('dotenv').config(); // Load secrets from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OpenAI } = require('openai');

const Job = require('./models/Job');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

// --- SECURE CONFIGURATION ---
// Now we use process.env to get the secrets
const MONGO_URI = process.env.MONGO_URI;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGO_URI || !GEMINI_API_KEY) {
    console.error("❌ FATAL ERROR: Missing API Keys in .env file");
    process.exit(1);
}

const client = new OpenAI({ apiKey: GEMINI_API_KEY, baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/" });

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Cloud Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- AUTH MIDDLEWARE ---
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        res.status(400).json({ msg: 'Token is not valid' });
    }
};

// --- AUTH ROUTES ---
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        let user = await User.findOne({ username });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ username, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: 36000 });
        res.json({ token, user: { id: user.id, username: user.username } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ msg: 'User does not exist' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: 36000 });
        res.json({ token, user: { id: user.id, username: user.username } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- JOB ROUTES (PROTECTED) ---
app.get('/jobs', auth, async (req, res) => {
    try {
        const jobs = await Job.find({ user: req.user.id }).sort({ appliedDate: -1 });
        res.json(jobs);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/jobs', auth, async (req, res) => {
    try {
        const newJob = new Job({ ...req.body, user: req.user.id });
        await newJob.save();
        res.json(newJob);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/jobs/:id', auth, async (req, res) => {
    try {
        const updatedJob = await Job.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, { new: true });
        res.json(updatedJob);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/jobs/:id', auth, async (req, res) => {
    try {
        await Job.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        res.json({ message: "Job deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Public Discovery
app.get('/api/recommendations', async (req, res) => {
    try {
        const response = await axios.get('https://jobicy.com/api/v2/remote-jobs?count=20&tag=software');
        const jobs = response.data.jobs.map((job, index) => ({
            id: index,
            company: job.companyName,
            position: job.jobTitle,
            location: job.jobGeo || "Remote",
            tags: job.jobType ? [job.jobType] : ["Dev"],
            url: job.url,
            date: job.pubDate,
            logo: job.companyLogo
        }));
        res.json(jobs);
    } catch (error) { res.json([]); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));