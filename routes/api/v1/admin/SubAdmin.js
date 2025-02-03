const express = require('express');

const router = express.Router();
const { checkSchema } = require('express-validator');

const SubAdminControl = require('../../../../controllers/api/v1/admin/SubAdmin');
const SubAdminSchema = require('../../../../schema-validation/admin/SubAdmin');
const ErrorHandleHelper = require('../../../../models/helpers/ErrorHandleHelper');

router.post(
  '/',
  checkSchema(SubAdminSchema.createAdmin),
  ErrorHandleHelper.requestValidator,
  SubAdminControl.postCreateAdmin
);
router.get('/', SubAdminControl.getAdminListing);
router.patch('/:id', SubAdminControl.adminChangeStatus);
router.delete('/:id', SubAdminControl.deleteAdmin);
router.get('/:id', SubAdminControl.getAdmin);
router.put(
  '/:id',
  checkSchema(SubAdminSchema.updateAdmin),
  ErrorHandleHelper.requestValidator,
  SubAdminControl.putUpdateAdmin
);
router.patch(
  '/change-password/:id',
  checkSchema(SubAdminSchema.changePassword),
  ErrorHandleHelper.requestValidator,
  SubAdminControl.changePassword
);
module.exports = router;
