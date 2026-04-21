import { NextFunction, Request, Response } from 'express';
import multer from 'multer';

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_IMAGE_SIZE_BYTES,
    },
    fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            cb(new Error('Only image uploads are allowed'));
            return;
        }

        cb(null, true);
    },
});

export const singleImageUpload = (req: Request, res: Response, next: NextFunction): void => {
    upload.single('image')(req, res, (err: any) => {
        if (!err) {
            next();
            return;
        }

        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({ error: 'Image exceeds 10MB size limit' });
            return;
        }

        res.status(400).json({ error: err.message || 'Invalid image upload request' });
    });
};
