const router = require('express').Router();
const controller = require('./controller');

router.route('/role/:id')
.get(controller.role.get)

module.exports = router;