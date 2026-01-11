const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Image = sequelize.define('Image', {
    filename: {
        type: DataTypes.STRING,
        allowNull: false
    },
    path: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mimetype: {
        type: DataTypes.STRING
    },
    size: {
        type: DataTypes.INTEGER
    },
    width: {
        type: DataTypes.INTEGER
    },
    height: {
        type: DataTypes.INTEGER
    },
    embedding: {
        type: DataTypes.JSON, 
        allowNull: true,
        comment: 'CLIP embedding vector as a JSON array'
    },
    tags: {
        type: DataTypes.JSON, 
        defaultValue: [],
        comment: 'List of tags'
    }
});

module.exports = Image;
