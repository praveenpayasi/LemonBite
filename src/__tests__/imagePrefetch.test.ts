import { Image } from 'react-native';

import { prefetchMenuImages } from '@/utils/imagePrefetch';
import type { MenuItem } from '@/types';

const IMAGES =
  'https://raw.githubusercontent.com/Meta-Mobile-Developer-PC/Working-With-Data-API/main/images';

function item(id: string, image: string): MenuItem {
  return { id, title: id, price: 1, description: 'x', image, category: 'Starters' };
}

describe('prefetchMenuImages', () => {
  it('prefetches each unique image URL once', async () => {
    const spy = jest.spyOn(Image, 'prefetch').mockResolvedValue(true);

    await prefetchMenuImages([
      item('a', `${IMAGES}/a.jpg`),
      item('b', `${IMAGES}/b.jpg`),
      item('a-again', `${IMAGES}/a.jpg`),
    ]);

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenCalledWith(`${IMAGES}/a.jpg`);
    expect(spy).toHaveBeenCalledWith(`${IMAGES}/b.jpg`);
    spy.mockRestore();
  });

  it('ignores non-http image values', async () => {
    const spy = jest.spyOn(Image, 'prefetch').mockResolvedValue(true);

    await prefetchMenuImages([item('legacy', 'greekSalad.jpg')]);

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('resolves even when an individual prefetch fails', async () => {
    const spy = jest.spyOn(Image, 'prefetch').mockRejectedValue(new Error('boom'));

    await expect(prefetchMenuImages([item('a', `${IMAGES}/a.jpg`)])).resolves.toBeUndefined();
    spy.mockRestore();
  });
});
