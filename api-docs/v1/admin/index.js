const swaggerUi = require('swagger-ui-express');
const router = require('express').Router();

const swagger = require('../../../config/swagger');
const web = swaggerUi.generateHTML(
    swagger.adminSetup,
);
router.use('', swaggerUi.serveFiles(swagger.adminSetup, {swaggerOptions: { displayRequestDuration: true }}));
router.get('', (req, res) => {
    res.send(web);
});
module.exports = router;



