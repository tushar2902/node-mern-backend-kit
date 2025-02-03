const swaggerUi = require('swagger-ui-express');
const router = require('express').Router();

const swagger = require('../../../config/swagger');

const mobile = swaggerUi.generateHTML(
    swagger.webMobileSetup,
);
router.use('', swaggerUi.serveFiles(swagger.webMobileSetup, {swaggerOptions: { displayRequestDuration: true }}));
router.get('', (req, res) => res.send(mobile));

module.exports = router;
