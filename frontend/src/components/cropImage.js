// frontend/src/components/cropImage.js

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // Needed for cross-origin images
    image.src = url;
  });

/**
 * This function was adapted from the "react-easy-crop" example on Github.
 * It takes an image source, a crop area in pixels, and rotation, and returns a cropped image as a Blob.
 */
async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  const safeArea = Math.max(image.width, image.height) * 2;

  // set canvas size to match the bounding box of the rotated image
  canvas.width = safeArea;
  canvas.height = safeArea;

  // translate canvas origin to the center of the image
  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  // draw rotated image on canvas
  ctx.drawImage(
    image,
    safeArea / 2 - image.width / 2,
    safeArea / 2 - image.height / 2
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  // set canvas width to final desired cropped image size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // paste generated image with correct offsets for x,y crop (for rotation)
  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width / 2 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height / 2 - pixelCrop.y)
  );

  // As a blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Canvas is empty');
        reject(new Error('Canvas is empty'));
        return;
      }
      // Create a file from the blob
      const file = new File([blob], 'cropped-image.jpeg', { type: 'image/jpeg' });
      resolve(file);
    }, 'image/jpeg', 0.95); // Use high quality for profile pictures
  });
}

export default getCroppedImg;
