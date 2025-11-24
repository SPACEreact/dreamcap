const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Config = sequelize.define('Config', {
    geminiKey: DataTypes.STRING,
    groqKey: DataTypes.STRING,
    hfKey: DataTypes.STRING,
    activeProvider: {
        type: DataTypes.STRING,
        defaultValue: 'gemini'
    }
});

module.exports = Config;
