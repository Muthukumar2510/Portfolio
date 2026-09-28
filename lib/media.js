import manifest from '../public/media/manifest.json';

// Looks up processed media (see scripts/media.mjs) by convention, so no image path is ever typed by hand.
// findMedia('profile/') → first image in public/media/profile/; findMedia('certs/cka') → public/media/certs/cka.*
export function findMedia(prefix) {
  const base = `/media/${prefix}`;
  const key = Object.keys(manifest)
    .sort()
    .find((k) => (prefix.endsWith('/') ? k.startsWith(base) : k.replace(/\.[a-z0-9]+$/i, '') === base));
  return key ? { src: key, ...manifest[key] } : null;
}
