import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand, PutObjectCommandOutput } from '@aws-sdk/client-s3';
import axios from 'axios';

import { s3Client } from '../libs/s3Client';

// export const bucketParams = {
//   Bucket: `test-bucket-${Math.ceil(Math.random() * 10 ** 10)}`,
//   Key: `test-object-${Math.ceil(Math.random() * 10 ** 10)}`,
//   Body: 'BODY',
// };

const fetchPresignedUrlAndUploadToS3 = async (bucketParams: {
  Bucket: string;
  Key: string;
  Body: any;
}) => {
  try {
    const command = new PutObjectCommand(bucketParams);
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });
    console.log(
      `\nPutting "${bucketParams.Key}" using signedUrl with body "${bucketParams.Body}" in s3`
    );
    const resp = await axios.put(signedUrl, bucketParams.Body);
    return resp.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export { fetchPresignedUrlAndUploadToS3 };
