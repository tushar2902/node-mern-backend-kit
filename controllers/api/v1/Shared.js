const {
  resCode,
  genRes,
  errorTypes,
  errorMessage,
  generateCloudFrontUrl,
} = require('../../../config/options');

const PostalPincodeRepository = require('../../../models/repositories/PostalPincodeRepository');
const AWSHelpers = require('../../../models/helpers/AWSHelper');

exports.postUploadMedia = async (req, res) => {
  if (req.file) {
    return res.json(
      genRes(resCode.HTTP_OK, {
        data: req.file,
        cdn: generateCloudFrontUrl(req.file.key),
      })
    );
  }
  //   customErrorLogger(e);
  return res
    .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
    .json(
      genRes(
        resCode.HTTP_INTERNAL_SERVER_ERROR,
        errorMessage.SERVER_ERROR,
        errorTypes.INTERNAL_SERVER_ERROR
      )
    );
};

exports.getPostSignedURL = async (req, res) => {
  try {
    const filePath = `uploads/${Date.now()}-${req.query.fileName}`;
    const url = await AWSHelpers.generateSignedURL(filePath);
    res
      .status(resCode.HTTP_OK)
      .json(genRes(resCode.HTTP_OK, { url, filePath }));
  } catch (e) {
    customErrorLogger(e);
    return res
      .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
      .json(
        genRes(
          resCode.HTTP_INTERNAL_SERVER_ERROR,
          errorMessage.SERVER_ERROR,
          errorTypes.INTERNAL_SERVER_ERROR
        )
      );
  }
};

exports.searchByPincode = async (req, res) => {
  try {
    const response = await PostalPincodeRepository.searchByPincode(
      req.params.pincode
    );
    return res
      .status(resCode.HTTP_OK)
      .json(genRes(resCode.HTTP_OK, response[0]));
  } catch (e) {
    customErrorLogger(e);
    return res
      .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
      .json(
        genRes(resCode.HTTP_INTERNAL_SERVER_ERROR, errorMessage.SERVER_ERROR)
      );
  }
};
