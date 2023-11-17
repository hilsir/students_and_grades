require('dotenv').config(); //.env

const { connect, StringCodec } = require('nats');

const sequelize = require('./db.tsx');
const express = require('express');
const router = require('./routes/index.tsx');
const createRecords = require('./logic/createRecords.tsx');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.use(router);

const Start = async () => {
    try {
        //подключение к бд
        await sequelize.authenticate();
        //сверяет бд со схемой данных
        await sequelize.sync({ force: false });
        app.listen(PORT, () => console.log('Server started on port ' + PORT));
    } catch (e) {
        console.log(e);
    }

    //подключить сервер
    const nc = await connect({ servers: '192.162.246.63:4222' });
    const sc = StringCodec();

    //(каждые 15 сек)
    const sub = nc.subscribe('students.v1.graded');

    await (async () => {
        //проверяем
        for await (const m of sub) {
            const dataSub = JSON.parse(sc.decode(m.data));
            //создание новых записей
            createRecords(dataSub, nc, sc);
        }
    })();
};

Start();
