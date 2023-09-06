import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as multerS3 from 'multer-s3';
import { basename, extname } from 'path';

export const factoryOptionMulterS3AWS = (
  configService: ConfigService,
): MulterOptions => {
  return {
    storage: multerS3({
      s3: new S3Client({
        region: configService.get('REGION_S3_AWS'),
        credentials: {
          accessKeyId: configService.get('ACCESS_KEY_ID_S3_AWS'),
          secretAccessKey: configService.get('SECRET_ACCESS_KEY_S3_AWS'),
        },
      }),
      bucket: configService.get('BUCKET_S3_AWS'),
      acl: 'public-read',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      metadata(req, file, callback) {
        callback(null, { owner: 'it' });
      },
      key(req, file, callback) {
        const ext = extname(file.originalname);
        const baseName = basename(file.originalname, ext);
        const fileName = `images/${baseName}-${Date.now()}${ext}`;
        callback(null, fileName);
      },
    }),
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  };
};
