// Backend API Handler Example for ImageKit Upload
// This is an example showing how to handle image uploads on your backend
// Adapt this to your backend framework (Express, Fastify, etc.)

/**
 * NODEJS + EXPRESS EXAMPLE
 * 
 * Install dependencies:
 * npm install imagekit axios
 * 
 * Environment variables (.env):
 * IMAGEKIT_PUBLIC_KEY=your_public_key
 * IMAGEKIT_PRIVATE_KEY=your_private_key
 * IMAGEKIT_URL_ENDPOINT=https://your-endpoint.imagekit.io
 */

/*
import express from 'express';
import multer from 'multer';
import ImageKit from 'imagekit';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// POST /api/upload - Upload single image
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const folder = req.body.folder || '/admin-products';
    
    const result = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname,
      folder: folder,
      isPrivateFile: false,
      useUniqueFileName: true,
      customMetadata: {
        uploadedBy: req.user?.id, // if using authentication
      }
    });

    res.json({
      fileId: result.fileId,
      name: result.name,
      url: result.url,
      fileSize: result.size,
      height: result.height,
      width: result.width,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// DELETE /api/upload/:fileId - Delete image
router.delete('/upload/:fileId', async (req, res) => {
  try {
    await imagekit.deleteFile(req.params.fileId);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

export default router;
*/

/**
 * PYTHON + FLASK EXAMPLE
 */

/*
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
import imagekitio
from imagekitio.models.UploadFileRequestOptions import UploadFileRequestOptions
import os

upload_bp = Blueprint('upload', __name__)

imagekit = imagekitio.ImageKit(
    private_key=os.getenv('IMAGEKIT_PRIVATE_KEY'),
    public_key=os.getenv('IMAGEKIT_PUBLIC_KEY'),
    url_endpoint=os.getenv('IMAGEKIT_URL_ENDPOINT')
)

@upload_bp.route('/upload', methods=['POST'])
@cross_origin()
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        folder = request.form.get('folder', '/admin-products')
        
        upload_options = UploadFileRequestOptions(
            file=file.stream.read(),
            file_name=file.filename,
            folder=folder,
            is_private_file=False,
            use_unique_file_name=True,
        )
        
        result = imagekit.upload(upload_options)
        
        return jsonify({
            'fileId': result.response_metadata.raw['fileId'],
            'name': result.response_metadata.raw['name'],
            'url': result.response_metadata.raw['url'],
            'fileSize': result.response_metadata.raw['size'],
            'height': result.response_metadata.raw['height'],
            'width': result.response_metadata.raw['width'],
        })
    except Exception as error:
        print(f'Upload error: {error}')
        return jsonify({'error': 'Upload failed'}), 500

@upload_bp.route('/upload/<file_id>', methods=['DELETE'])
@cross_origin()
def delete_file(file_id):
    try:
        imagekit.delete_file(file_id)
        return jsonify({'success': True})
    except Exception as error:
        print(f'Delete error: {error}')
        return jsonify({'error': 'Delete failed'}), 500
*/

/**
 * SETUP INSTRUCTIONS:
 * 
 * 1. Sign up at https://imagekit.io/
 * 
 * 2. Create a new ImageKit project and get your credentials:
 *    - Public Key
 *    - Private Key
 *    - URL Endpoint (e.g., https://your-endpoint.imagekit.io)
 * 
 * 3. Add environment variables to your .env files:
 * 
 *    Frontend (.env):
 *    VITE_IMAGEKIT_PUBLIC_KEY=your_public_key
 *    VITE_IMAGEKIT_URL_ENDPOINT=https://your-endpoint.imagekit.io
 * 
 *    Backend (.env):
 *    IMAGEKIT_PUBLIC_KEY=your_public_key
 *    IMAGEKIT_PRIVATE_KEY=your_private_key
 *    IMAGEKIT_URL_ENDPOINT=https://your-endpoint.imagekit.io
 * 
 * 4. Set up your backend API endpoint at /api/upload to handle file uploads
 * 
 * 5. Update the uploadToImageKit function in imagekit.ts to match your backend URL
 * 
 * 6. In your Products.tsx component, use the uploadMultipleToImageKit function
 *    to upload files when saving:
 * 
 *    const uploadedImages = await uploadMultipleToImageKit(
 *      imageFiles.map(img => img.file),
 *      'admin-products'
 *    );
 *    const imageUrls = uploadedImages.map(img => img.url);
 */
