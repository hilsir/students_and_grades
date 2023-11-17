const Router = require('express');
const router = new Router();

const mainController = require('../controllers/mainController.tsx');

router.get('/statistic/:personalCode', mainController.statistic);
router.get('/log', mainController.log);

module.exports = router;
