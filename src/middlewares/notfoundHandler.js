// /middlewares/notFoundHandler.js
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
};

export default notFoundHandler;
