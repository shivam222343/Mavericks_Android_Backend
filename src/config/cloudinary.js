const cloudinary = require('cloudinary').v2;
const https = require('https');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = 'mavericksPreset'; // unsigned preset

console.log('☁️ Cloudinary configured:', {
    cloud_name: CLOUD_NAME ? '✅' : '❌',
    api_key: process.env.CLOUDINARY_API_KEY ? '✅' : '❌',
    api_secret: process.env.CLOUDINARY_API_SECRET ? '✅' : '❌',
    upload_preset: UPLOAD_PRESET,
});

/**
 * Upload image to Cloudinary
 * @param {string} filePath - Path to the file
 * @param {string} folder - Folder name in Cloudinary
 * @returns {Promise<object>} - Upload result
 */
const uploadImage = async (filePath, folder = 'mavericks') => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder,
            resource_type: 'auto',
            timeout: 600000,
        });
        return {
            url: result.secure_url,
            publicId: result.public_id
        };
    } catch (error) {
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image
 * @returns {Promise<object>} - Delete result
 */
const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        throw new Error(`Cloudinary delete failed: ${error.message}`);
    }
};

/**
 * Upload image from buffer to Cloudinary using unsigned preset (via HTTPS POST).
 * Signed SDK uploads are restricted on this account — unsigned preset is used instead.
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Folder name in Cloudinary (used as a tag, not a path, with unsigned preset)
 * @returns {Promise<object>} - Upload result
 */
const uploadImageBuffer = (buffer, folder = 'mavericks') => {
    return new Promise((resolve, reject) => {
        const base64 = buffer.toString('base64');
        const dataUri = `data:image/jpeg;base64,${base64}`;

        const body = JSON.stringify({
            file: dataUri,
            upload_preset: UPLOAD_PRESET,
            tags: [folder],
        });

        const options = {
            hostname: 'api.cloudinary.com',
            path: `/v1_1/${CLOUD_NAME}/image/upload`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
            },
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (res.statusCode === 200) {
                        resolve({
                            url: json.secure_url,
                            publicId: json.public_id,
                        });
                    } else {
                        reject(new Error(`Cloudinary upload failed: ${json.error?.message || data}`))
                    }
                } catch (parseErr) {
                    reject(new Error(`Cloudinary upload failed: ${data}`));
                }
            });
        });

        req.on('error', (err) => reject(new Error(`Cloudinary upload failed: ${err.message}`)));
        req.write(body);
        req.end();
    });
};

module.exports = {
    cloudinary,
    uploadImage,
    uploadImageBuffer,
    deleteImage
};
