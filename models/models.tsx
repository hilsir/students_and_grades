const sequelize = require('../db.tsx');
const { Sequelize, DataTypes, Model } = require('sequelize');

const Student = sequelize.define(
    'student',
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        personalCode: DataTypes.STRING,
        name: DataTypes.STRING,
        lastName: DataTypes.STRING,
    },
    {
        timestamps: false,
    },
);

const Assessment = sequelize.define(
    'assessment',
    {
        date: DataTypes.DATE,
        subject: DataTypes.STRING,
        grade: DataTypes.INTEGER,
    },
    {
        timestamps: false,
    },
);

//сохранять уникальные предметы
const Subject = sequelize.define(
    'subject',
    {
        subject: DataTypes.STRING,
    },
    {
        timestamps: false,
    },
);

Student.hasMany(Assessment);
Assessment.belongsTo(Student);

module.exports = {
    sequelize,
    Student: Student,
    Assessment: Assessment,
    Subject: Subject,
};
