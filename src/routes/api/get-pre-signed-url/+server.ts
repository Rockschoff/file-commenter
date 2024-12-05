import type { RequestHandler } from '@sveltejs/kit';
import AWS from 'aws-sdk';

// AWS S3 Configuration
const s3 = new AWS.S3({
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
    region: import.meta.env.VITE_AWS_REGION,
});

const s3Bucket = import.meta.env.VITE_AWS_S3_BUCKET as string;

export const POST: RequestHandler = async ({ request }) => {
    try {
        console.log('get-pre-signed-url')
        const { key } = await request.json(); // Parse JSON body

        if (!key || key.trim() === "") {
            return new Response(JSON.stringify({ error: 'No key provided' }), { status: 400 });
        }

        console.log(key)
        // Generate a pre-signed URL
        const params = {
            Bucket: s3Bucket,
            Key: key,
            Expires: 604800, // URL expiration time in seconds (7 days)
        };

        console.log("fetching URL")

        const url = await s3.getSignedUrlPromise('getObject', params);

        console.log(url)

        return new Response(
            JSON.stringify({ url }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error generating pre-signed URL:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to generate pre-signed URL' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
