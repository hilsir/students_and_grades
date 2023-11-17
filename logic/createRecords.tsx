const { Student, Assessment, Subject } = require('../models/models.tsx');
module.exports = (dataSub, nc, sc) => {
    const personalCode = dataSub.data.personalCode;
    (async () => {
        //поиск по коду студента
        let studentBd = await Student.findOne({ where: { personalCode } });
        //добавить данного студента если он отсутствует
        if (!studentBd) {
            //запрос данных о студенте
            const req = await nc.request(
                'students.v1.get',
                JSON.stringify({ personalCode: dataSub.data.personalCode }),
            );
            const dataReq = JSON.parse(sc.decode(req.data));

            await Student.create({
                personalCode: dataReq.data.personalCode,
                name: dataReq.data.name,
                lastName: dataReq.data.lastName,
            });

            //обновить на нового добавленного студента
            studentBd = await Student.findOne({ where: { personalCode } });
        }

        const subject = dataSub.data.subject;
        //если такой предмет не встречался, то добавим его
        const subjectBd = await Subject.findOne({ where: { subject } });
        if (!subjectBd) {
            await Subject.create({
                subject: dataSub.data.subject,
            });
        }

        //создать запись об оценке
        console.log('-Создание записи об оценке-');
        await Assessment.create({
            personalCode: dataSub.data.personalCode,
            grade: dataSub.data.grade,
            subject: dataSub.data.subject,
            date: new Date(),
            studentId: studentBd.id,
        });
    })();
};
