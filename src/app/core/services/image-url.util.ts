import { environment } from '../../../environments/environment';

/** API returns image paths like "/uploads/properties/xyz.png" relative to the API host. */
export function resolveImageUrl(path: string | null | undefined): string {
  if (!path) {
    return '';
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const apiRoot = environment.apiUrl.replace(/\/api\/?$/, '');
  return `${apiRoot}${path.startsWith('/') ? '' : '/'}${path}`;
}
