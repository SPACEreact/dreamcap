const express = require('express');
const cors = require('cors');
const { sequelize } = require('./database');
const Project = require('./models/Project');
const Config = require('./models/Config');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Initialize Database
sequelize.sync().then(() => {
    console.log('SQLite Database connected and synced');
});

// Routes

// Get all projects
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await Project.findAll({ order: [['updatedAt', 'DESC']] });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Save a project
app.post('/api/projects', async (req, res) => {
    try {
        const { id, title, data } = req.body;
        if (id) {
            // Update existing
            const project = await Project.findByPk(id);
            if (project) {
                project.title = title;
                project.data = JSON.stringify(data);
                await project.save();
                return res.json(project);
            }
        }
        // Create new
        const newProject = await Project.create({
            title,
            data: JSON.stringify(data)
        });
        res.json(newProject);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get API Keys
app.get('/api/config', async (req, res) => {
    try {
        const config = await Config.findOne({ where: { id: 1 } });
        if (!config) return res.json({});
        res.json({
            gemini: config.geminiKey,
            groq: config.groqKey,
            hf: config.hfKey,
            activeProvider: config.activeProvider
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Save API Keys
app.post('/api/config', async (req, res) => {
    try {
        const { gemini, groq, hf, activeProvider } = req.body;
        let config = await Config.findOne({ where: { id: 1 } });
        if (!config) {
            config = await Config.create({ id: 1 });
        }
        if (gemini !== undefined) config.geminiKey = gemini;
        if (groq !== undefined) config.groqKey = groq;
        if (hf !== undefined) config.hfKey = hf;
        if (activeProvider !== undefined) config.activeProvider = activeProvider;
        await config.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
