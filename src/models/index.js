const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite', // or specify a file for persistent storage
    logging: false // disable logging; default: console.log
});

const Conversation = sequelize.define('Conversation', {
    userMessage: {
        type: DataTypes.STRING,
        allowNull: false
    },
    botResponse: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

sequelize.sync();

module.exports = { sequelize, Conversation };
