const { sequelize } = require('./database');
const Config = require('./models/Config');
(async () => {
    try {
        await sequelize.sync();
        const config = await Config.findOne({ where: { id: 1 } });
        console.log('Config:', config ? config.toJSON() : 'none');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
})();
