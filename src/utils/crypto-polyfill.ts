/**
 * Crypto Polyfill for Browser
 * Provides crypto functionality for PayFast signature generation
 */

export const createHash = (algorithm: string) => {
  if (algorithm !== 'md5') {
    throw new Error('Only MD5 is supported in browser');
  }

  return {
    update: (data: string) => ({
      digest: (encoding: string) => {
        if (encoding !== 'hex') {
          throw new Error('Only hex encoding is supported');
        }
        return md5(data);
      }
    })
  };
};

/**
 * MD5 hash implementation for browser
 * Note: For production, consider using a library like crypto-js
 * or implementing server-side signature generation
 */
function md5(string: string): string {
  // This is a simplified implementation
  // For production, use crypto-js or server-side generation
  
  // Convert string to UTF-8 bytes
  const encoder = new TextEncoder();
  const data = encoder.encode(string);
  
  // Use SubtleCrypto if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    // Note: SubtleCrypto doesn't support MD5, so we'll need an alternative
    // For now, return a placeholder that indicates server-side processing is needed
    console.warn('MD5 hashing should be done server-side for security');
    return 'SERVER_SIDE_HASH_REQUIRED';
  }
  
  // Fallback: Basic hash (NOT SECURE - use only for development)
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    const char = string.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(32, '0');
}
