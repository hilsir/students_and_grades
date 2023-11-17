const { Student, Assessment, Subject } = require('../models/models.tsx');
const { Op, sequelize } = require('sequelize');

class MainController {
    async statistic(req, res, next) {
        const personalCode = req.params.personalCode;
        //данные о студенте
        const studentBd = await Student.findOne({ where: { personalCode } });

        if (!studentBd) {
            return res.json('-There is no such student-');
        }

        //список предметов в массив
        const subjects = await Subject.findAll({ attributes: ['subject'] });
        const subjectsArray = subjects.map(function (item) {
            return item.subject;
        });

        const maxGrade = async (subject) => {
            return await Assessment.max('grade', {
                where: {
                    [Op.and]: [{ subject: subject }, { studentId: studentBd.id }],
                },
            });
        };

        const minGrade = async (subject) => {
            return await Assessment.min('grade', {
                where: {
                    [Op.and]: [{ subject: subject }, { studentId: studentBd.id }],
                },
            });
        };

        const totalGrades = async (subject) => {
            return await Assessment.count({
                where: {
                    [Op.and]: [{ subject: subject }, { studentId: studentBd.id }],
                },
            });
        };

        const avgGrade = async (subject) => {
            const avg =
                (await Assessment.sum('grade', {
                    where: {
                        [Op.and]: [{ subject: subject }, { studentId: studentBd.id }],
                    },
                })) / (await totalGrades(subject));
            //округлить до сотых
            return Math.round(avg * 100) / 100;
        };

        //сбор всех данных об оценках
        const statistic = await Promise.all(
            subjectsArray.map(async (subject) => ({
                subject: subject, // код предмета
                maxGrade: await maxGrade(subject), // максимальная оценка
                minGrade: await minGrade(subject), // минималььная оценка
                avgGrade: await avgGrade(subject), // средняя оценка (дробное число)
                totalGrades: await totalGrades(subject), // всего получено оценок
            })),
        );

        return res.json({
            student: {
                personalCode: studentBd.personalCode,
                name: studentBd.name,
                lastName: studentBd.lastName,
            },
            statistic,
        });
    }

    async log(req, res, next) {
        const limit = req.query.limit; //5
        const offset = req.query.page; //1

        const endIndex = offset * limit; //5

        const AssessmentLog = await Assessment.findAll({
            attributes: ['date', 'subject', 'grade'],
            include: [
                {
                    model: Student,
                    attributes: ['personalCode', 'name', 'lastName'],
                },
            ],
            ...(limit && endIndex ? { limit: limit, offset: endIndex } : {}),
        });
        return await res.json(AssessmentLog);
    }
}

module.exports = new MainController();
