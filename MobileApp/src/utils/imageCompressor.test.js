/**
 * Unit tests for imageCompressor utility
 */

import { compressImage, QUALITY_PRESETS } from './imageCompressor';

// Mock expo-image-manipulator
jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn().mockResolvedValue({
    uri: 'file://compressed/test.jpg',
    width: 1280,
    height: 960,
  }),
  SaveFormat: { JPEG: 'jpeg' },
}));

describe('imageCompressor', () => {
  it('compressImage returns a compressed uri', async () => {
    const result = await compressImage('file://test/original.jpg');
    expect(result.uri).toBe('file://compressed/test.jpg');
    expect(result.width).toBe(1280);
  });

  it('QUALITY_PRESETS has thumbnail, standard, high', () => {
    expect(QUALITY_PRESETS.thumbnail.quality).toBe(0.5);
    expect(QUALITY_PRESETS.standard.quality).toBe(0.75);
    expect(QUALITY_PRESETS.high.quality).toBe(0.9);
  });

  it('compressImage accepts quality override', async () => {
    const { manipulateAsync } = require('expo-image-manipulator');
    await compressImage('file://test/original.jpg', { quality: 0.5 });
    expect(manipulateAsync).toHaveBeenCalledWith(
      'file://test/original.jpg',
      expect.any(Array),
      expect.objectContaining({ compress: 0.5 })
    );
  });
});