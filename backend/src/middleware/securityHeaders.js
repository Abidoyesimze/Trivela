/**
 * Security headers middleware.
 *
 * Applies a defence-in-depth header set to every API response.
 * Embed routes (/embed/*) receive a relaxed X-Frame-Options so campaign
 * cards can be iframed by third-party sites.
 */

const HSTS = 'max-age=63072000; includeSubDomains; preload';
const REFERRER = 'strict-origin-when-cross-origin';
const PERMISSIONS = 'camera=(), microphone=(), geolocation=()';

function buildCsp() {
  const self = "'self'";
  const rpcUrls = (process.env.SOROBAN_RPC_URLS || '').split(',').map((u) => u.trim()).filter(Boolean).join(' ');
  const horizonUrl = (process.env.HORIZON_URL || '').trim();
  const connectSrc = [self, rpcUrls, horizonUrl].filter(Boolean).join(' ');
  return (
    `default-src ${self}; ` +
    `connect-src ${connectSrc}; ` +
    `script-src ${self}; ` +
    `style-src ${self} 'unsafe-inline'; ` +
    `img-src ${self} data: https:; ` +
    `frame-ancestors 'none'`
  );
}

function buildEmbedCsp(origin) {
  const self = "'self'";
  const rpcUrls = (process.env.SOROBAN_RPC_URLS || '').split(',').map((u) => u.trim()).filter(Boolean).join(' ');
  const horizonUrl = (process.env.HORIZON_URL || '').trim();
  const connectSrc = [self, rpcUrls, horizonUrl].filter(Boolean).join(' ');
  const frameAncestors = origin ? `${self} ${origin}` : '*';
  return (
    `default-src ${self}; ` +
    `connect-src ${connectSrc}; ` +
    `script-src ${self}; ` +
    `style-src ${self} 'unsafe-inline'; ` +
    `img-src ${self} data: https:; ` +
    `frame-ancestors ${frameAncestors}`
  );
}

export default function securityHeaders(req, res, next) {
  const isEmbed = req.path.startsWith('/embed/');
  const embedOrigin = typeof req.headers['x-embed-origin'] === 'string'
    ? req.headers['x-embed-origin'].trim()
    : '';

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', REFERRER);
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Permissions-Policy', PERMISSIONS);
  res.setHeader('Content-Security-Policy', isEmbed ? buildEmbedCsp(embedOrigin) : buildCsp());

  if (isEmbed) {
    // Allow third-party sites to iframe embed routes.
    // omit X-Frame-Options entirely — CSP frame-ancestors governs this.
  } else {
    res.setHeader('X-Frame-Options', 'DENY');
  }

  const forwardedProto = req.headers['x-forwarded-proto'];
  const isHttps = req.secure || (typeof forwardedProto === 'string' && forwardedProto.includes('https'));
  if (isHttps) {
    res.setHeader('Strict-Transport-Security', HSTS);
  }

  next();
}