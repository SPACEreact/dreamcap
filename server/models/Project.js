const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Project = sequelize.define('Project', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    data: {
        type: DataTypes.TEXT, // JSON string of the entire state
        allowNull: false
    }
});

module.exports = Project;
