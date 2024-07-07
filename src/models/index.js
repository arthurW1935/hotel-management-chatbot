const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite', 
    logging: false
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
