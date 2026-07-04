export const optimizeImageFile = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error("No file provided"));
            return;
        }
        if (!file.type.startsWith('image/')) {
            // Not an image, return original
            resolve(file);
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            _processImageSrc(event.target.result, file.name || "optimized.jpeg", maxWidth, maxHeight, quality, resolve, reject);
        };
        reader.onerror = (error) => reject(error);
    });
};

export const optimizeBase64Image = (base64Str, fileName = "optimized.jpeg", maxWidth = 1200, maxHeight = 1200, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        if (!base64Str) {
            reject(new Error("No base64 string provided"));
            return;
        }
        _processImageSrc(base64Str, fileName, maxWidth, maxHeight, quality, resolve, reject);
    });
};

const _processImageSrc = (src, fileName, maxWidth, maxHeight, quality, resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
            if (width > maxWidth) {
                height = Math.round(height * (maxWidth / width));
                width = maxWidth;
            }
        } else {
            if (height > maxHeight) {
                width = Math.round(width * (maxHeight / height));
                height = maxHeight;
            }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'));
                    return;
                }
                const newName = fileName.replace(/\.[^/.]+$/, "") + ".jpeg";
                const optimizedFile = new File([blob], newName, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                });
                resolve(optimizedFile);
            },
            'image/jpeg',
            quality
        );
    };
    img.onerror = (error) => reject(error);
};
