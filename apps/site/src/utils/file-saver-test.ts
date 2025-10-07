// Simple test to verify file-saver dynamic import works
export const testFileSaver = async (): Promise<boolean> => {
  try {
    const { saveAs } = await import('file-saver');
    return typeof saveAs === 'function';
  } catch (error) {
    console.error('file-saver import failed:', error);
    return false;
  }
};