const sendSuccess = (res, { message = 'Success', data = null, meta = null, statusCode = 200 }) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta,
  });
};

const sendError = (res, { message = 'Error', data = null, meta = null, statusCode = 500 }) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data,
    meta,
  });
};

module.exports = { sendSuccess, sendError };
