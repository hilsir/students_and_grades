require('dotenv').config(); //.env

const {connect, StringCodec} = require("nats");

const sequelize = require('./db.tsx')
const express = require('express')


const modeles = require('./models/models.tsx')
const router = require('./routes/index.tsx')

const logic = require('./logic/logic.tsx')

const app = express()
const PORT = process.env.PORT || 8080

//читать получаемые данные через json
app.use(express.json())

app.use(router)

const Start = async () => {

    try {
        //подключение к бд
        await sequelize.authenticate()
        //сверяет бд со схемой данных
        await sequelize.sync({ force: false });
        console.log('Соединение с postgres установлено');
        //старт
        app.listen(PORT, () => console.log('Server started on port ' + PORT))
    } catch (e) {
        console.log('Соединение с postgres НЕ установлено');
        console.log(e);
    }

    //подключить сервер
    const nc = await connect({servers: "192.162.246.63:4222"});
    const sc = StringCodec();

    //постояный запрос (каждые 15 сек) на получение оценки стедента
    const sub = nc.subscribe("students.v1.graded");
    //запрос студента по номеру
    // const req = await nc.request("students.v1.get", JSON.stringify({personalCode: "9245EE000878"}));
    await (async () => {
        // console.log(`${sc.decode(req.data)}`);

        //постояно проверяем
        for await (const m of sub) {
            //console.log(`[${sub.getProcessed()}]: ${sc.decode(m.data)}`);
            const dataSub = JSON.parse(sc.decode(m.data))

            logic(dataSub,nc,sc);
            //console.log(dataReq.data.name);

        }

        //console.log("subscription закрыт");
    })();

//await nc.drain();

};

//запросы nats
Start();

