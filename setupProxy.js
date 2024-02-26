const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/get-images',
    createProxyMiddleware({
      target: 'http://localhost:5000', // replace with your server url
      changeOrigin: true,
      secure: false, // set to false if your server doesn't have HTTPS
    })
  );
};