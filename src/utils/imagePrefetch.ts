import { Image } from 'react-native';

import type { MenuItem } from '@/types';

/**
 * Warms the image cache for the given menu items. Deduplicates URLs and uses
 * `allSettled` so a single failed image never rejects the whole preparation.
 */
export async function prefetchMenuImages(items: MenuItem[]): Promise<void> {
  const urls = Array.from(
    new Set(items.map((item) => item.image).filter((url) => /^https?:\/\//i.test(url))),
  );

  await Promise.allSettled(urls.map((url) => Image.prefetch(url)));
}
