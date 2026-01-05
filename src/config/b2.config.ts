import { registerAs } from '@nestjs/config';

export default registerAs('b2', () => ({
  applicationKeyId: process.env.B2_APP_KEY_ID,
  applicationKey: process.env.B2_APP_KEY,
  bucketId: process.env.B2_BUCKET_ID,
  bucketName: process.env.B2_BUCKET_NAME,
  downloadUrl: process.env.B2_DOWNLOAD_URL,
}));
