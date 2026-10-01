/**
 * Helper to resolve static assets across both local dev (root /) and GitHub Pages subpaths (/repo-name/)
 */
export function getAssetUrl(path: string | undefined | null): string {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }

  let cleanPath = path;
  while (cleanPath.startsWith('/') || cleanPath.startsWith('./')) {
    if (cleanPath.startsWith('./')) {
      cleanPath = cleanPath.slice(2);
    } else if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.slice(1);
    }
  }

  const base = (import.meta as any).env?.BASE_URL || './';
  return base.endsWith('/') ? `${base}${cleanPath}` : `${base}/${cleanPath}`;
}
