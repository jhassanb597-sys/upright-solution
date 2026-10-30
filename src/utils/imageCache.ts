import {Image} from 'expo-image';

const prefetched = new Set<string>();

export function prefetchImage(uri: string): void {
  if (!uri || prefetched.has(uri)) {
    return;
  }
  prefetched.add(uri);
  Image.prefetch(uri).catch(() => prefetched.delete(uri));
}

export function prefetchImages(uris: string[]): void {
  uris.forEach(prefetchImage);
}
