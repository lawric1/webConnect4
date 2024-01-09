export async function preloadImages(urls) {
    const loadedImages = {};
  
    const promises = Object.entries(urls).map(([name, url]) => {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = url;
  
        image.onload = () => {
          loadedImages[name] = image;
          resolve();
        };
  
        image.onerror = () => reject(`Image '${name}' failed to load: ${url}`);
      });
    });
  
    await Promise.all(promises);
  
    return loadedImages;
}