import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3_ACCESS_KEY_ID, S3_ACCESS_KEY_SECRET } from '$env/static/private';

export const s3Client = new S3Client({
	region: 'auto',
	credentials: {
		accessKeyId: S3_ACCESS_KEY_ID,
		secretAccessKey: S3_ACCESS_KEY_SECRET
	},
	endpoint: 'https://dd8a46fe7ab7b4faa61223989b2b9771.r2.cloudflarestorage.com'
});

export function createPresignedUrl(bucket: string, key: string, expiresIn: number) {
	const command = new PutObjectCommand({ Bucket: bucket, Key: key });

	return getSignedUrl(s3Client, command, {
		expiresIn
	});
}
