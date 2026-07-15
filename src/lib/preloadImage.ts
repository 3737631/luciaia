const decodedImages = new Map<string, Promise<boolean>>();

export function preloadImage(src: string): Promise<boolean> {
  if (!src) return Promise.resolve(false);

  if (decodedImages.has(src)) {
    return decodedImages.get(src)!;
  }

  const promise = new Promise<boolean>((resolve) => {
    const img = new Image();

    const finish = async () => {
      try {
        if (typeof img.decode === "function") {
          await img.decode();
        }
      } catch {}

      resolve(img.naturalWidth > 0);
    };

    img.onload = finish;
    img.onerror = () => resolve(false);
    img.src = src;

    if (img.complete && img.naturalWidth > 0) {
      finish();
    }
  });

  decodedImages.set(src, promise);
  return promise;
}

export function isImageCached(src: string): boolean {
  if (!src) return false;
  return decodedImages.has(src);
}
