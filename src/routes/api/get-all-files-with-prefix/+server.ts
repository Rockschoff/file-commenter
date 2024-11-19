import AWS from 'aws-sdk';
import type { RequestHandler } from '@sveltejs/kit';

// Configure AWS SDK with environment variables
const s3 = new AWS.S3({
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
    region: import.meta.env.VITE_AWS_REGION,
});

const listAllObjects = async (bucket: string, prefix: string, continuationToken?: string): Promise<string[]> => {
    const params: AWS.S3.ListObjectsV2Request = {
        Bucket: bucket,
        Prefix: prefix === '/' ? '' : prefix,
        ContinuationToken: continuationToken, // Handle pagination
    };

    const data = await s3.listObjectsV2(params).promise();

    // Map keys and filter out undefined values
    const keys = (data.Contents?.map((item) => item.Key) || []).filter((key): key is string => !!key);

    if (data.IsTruncated) {
        // Recursively fetch the next set of results
        const nextKeys = await listAllObjects(bucket, prefix, data.NextContinuationToken);
        return [...keys, ...nextKeys];
    }

    return keys;
};

export const POST: RequestHandler = async ({ request }) => {
    const body = await request.json();
    const { prefix } = body as { prefix: string };

    console.log("PREFIX" , prefix)

    if (!prefix) {
        return new Response(
            JSON.stringify({ error: 'Prefix is required' }),
            { status: 400 }
        );
    }

    try {
        const bucket = import.meta.env.VITE_AWS_S3_BUCKET;

        // Fetch all objects recursively
        const keys = await listAllObjects(bucket, prefix);

        return new Response(
            JSON.stringify({ keys }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (err: any) {
        console.error('Error listing objects in S3:', err);

        return new Response(
            JSON.stringify({ error: 'Failed to list objects in S3', details: err.message }),
            { status: 500 }
        );
    }
};
