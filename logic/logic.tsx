const {Student, Assessment, Subject} = require('../models/models.tsx')
module.exports = (dataSub, nc, sc) => {
    console.log(" ")
    console.log("-пришла оценка-")
    console.log("код студента: " + dataSub.data.personalCode)
    console.log("предмет: " + dataSub.data.subject);
    console.log("ценка: " + dataSub.data.grade);

    const personalCode = dataSub.data.personalCode;
    (async () => {
        //поиск по коду студента
        console.log("-Проверка наличия студента-")
        var studentBd = await Student.findOne({where: {personalCode}})

        if (!studentBd) {
            console.log("-Студент отсутствует в бд, запрос данных о студенте-")
            const req = await nc.request("students.v1.get", JSON.stringify({personalCode: dataSub.data.personalCode}));
            const dataReq = JSON.parse(sc.decode(req.data))
            //console.log(dataReq.data.name);
            await Student.create({
                personalCode: dataReq.data.personalCode,
                name: dataReq.data.name,
                lastName: dataReq.data.lastName
            });
            //занести добавленного
            studentBd = await Student.findOne({where: {personalCode}})
            console.log("-Студент добавлен в бд-")
        }

        const subject = dataSub.data.subject
        //если такой предмет невстречался запишим его
        const subjectBd = await Subject.findOne({where: {subject}})
        if(!subjectBd){
            console.log("-Предмет отсутствеет -запись-")
            await Subject.create({
                subject: dataSub.data.subject
            });
        }




        // dataSub.data.subject
        // if()

        //создать запись об оценке
        console.log("-Создание записи об оценке-")
        await Assessment.create({
            personalCode: dataSub.data.personalCode,
            grade: dataSub.data.grade,
            subject: dataSub.data.subject,
            date: new Date(),
            studentId: studentBd.id
        });

    })()
}

