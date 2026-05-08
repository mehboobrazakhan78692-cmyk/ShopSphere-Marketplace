/**
 * Simple CSRF protection for APIs
 * Since we use custom headers (X-ShopSphere-CSRF) for all state-changing requests,
 * browsers won't allow cross-origin requests to add this header without a pre-flight CORS check.
 */
const csrfProtection = (req, res, next) => {
  const method = req.method;
  
  // Skip for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return next();
  }

  // Check for custom header
  const csrfHeader = req.headers['x-shopsphere-csrf'];
  
  if (!csrfHeader) {
    return res.status(403).json({
      success: false,
      message: 'CSRF protection: X-ShopSphere-CSRF header missing',
    });
  }

  next();
};

module.exports = csrfProtection;
