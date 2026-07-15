type ImageStatus = "pending" | "ready" | "error";

type ImageCacheEntry = {
  status: ImageStatus;
  image: HTMLImageElement;
  promise: Promise<boolean>;
};

const imageCache = new Map<string, ImageCacheEntry>();

function waitForImageLoad(image: HTMLImageElement): Promise<boolean> {
  if (image.complete) {
    return Promise.resolve(image.naturalWidth > 0);
  }
  return new Promise((resolve) => {
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
  });
}

export function preloadImage(src: string): Promise<boolean> {
  if (!src) return Promise.resolve(false);

  const existing = imageCache.get(src);
  if (existing) return existing.promise;

  const image = new Image();
  const entry: ImageCacheEntry = {
    status: "pending",
    image,
    promise: Promise.resolve(false),
  };

  entry.promise = (async () => {
    image.src = src;
    const loaded = await waitForImageLoad(image);
    if (!loaded) {
      entry.status = "error";
      return false;
    }
    try {
      if (typeof image.decode === "function") {
        await image.decode();
      }
    } catch {}
    if (image.naturalWidth <= 0) {
      entry.status = "error";
      return false;
    }
    entry.status = "ready";
    return true;
  })();

  imageCache.set(src, entry);
  return entry.promise;
}

export function isImageReady(src: string): boolean {
  return imageCache.get(src)?.status === "ready";
}

export function getImageStatus(src: string): ImageStatus | "missing" {
  return imageCache.get(src)?.status ?? "missing";
}

export { isImageReady as isImageCached };
