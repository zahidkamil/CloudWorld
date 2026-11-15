export interface WebGLSupport {
  supported: boolean;
  version: 0 | 1 | 2;
  renderer?: string;
  maxTextureSize?: number;
  reason?: string;
}

let cached: WebGLSupport | undefined;

/**
 * Detects WebGL support once per page. CloudWorld targets WebGL 2 (Three.js default)
 * and reports WebGL 1-only browsers as unsupported so the UI can show a clear message.
 */
export function detectWebGL(doc: Document = document): WebGLSupport {
  if (cached) return cached;
  try {
    const canvas = doc.createElement('canvas');
    const gl2 = canvas.getContext('webgl2');
    if (gl2) {
      const debug = gl2.getExtension('WEBGL_debug_renderer_info');
      cached = {
        supported: true,
        version: 2,
        renderer: String(gl2.getParameter(debug ? debug.UNMASKED_RENDERER_WEBGL : gl2.RENDERER)),
        maxTextureSize: Number(gl2.getParameter(gl2.MAX_TEXTURE_SIZE)),
      };
      gl2.getExtension('WEBGL_lose_context')?.loseContext();
      return cached;
    }
    const gl1 = canvas.getContext('webgl');
    cached = gl1
      ? {
          supported: false,
          version: 1,
          reason: 'This browser only supports WebGL 1. CloudWorld needs WebGL 2.',
        }
      : { supported: false, version: 0, reason: 'WebGL is unavailable or disabled in this browser.' };
  } catch {
    cached = { supported: false, version: 0, reason: 'WebGL could not be initialized.' };
  }
  return cached;
}

/** Test helper. */
export function resetWebGLCache() {
  cached = undefined;
}
