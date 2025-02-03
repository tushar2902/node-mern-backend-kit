exports.generateUrl = {
  fileName: {
    in: ['query'],
    notEmpty: true,
    errorMessage: 'File name cannot be empty',
  },
};
