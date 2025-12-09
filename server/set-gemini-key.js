const { sequelize } = require('./database');
const Config = require('./models/Config');

async function setGeminiKey(key) {
    try {
        await sequelize.sync();
        let config = await Config.findOne({ where: { id: 1 } });
        if (!config) {
            config = await Config.create({ id: 1, geminiKey: key });
        } else {
            config.geminiKey = key;
            await config.save();
        }
        console.log('✅ Gemini API key set successfully');
    } catch (err) {
        console.error('Error setting Gemini key:', err);
    } finally {
        process.exit();
    }
}

const key = process.argv[2];
if (!key) {
    console.error('Please provide a Gemini API key as argument');
    process.exit(1);
}
setGeminiKey(key);
