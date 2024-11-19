import AWS from 'aws-sdk';
import type { RequestHandler } from '@sveltejs/kit';

// Define types for S3 objects
interface FolderObject {
    S3Key: string;
    comment: string;
}

interface FileObject {
    S3Key: string;
    comment: string;
    status: boolean;
}

// Configure AWS SDK with environment variables
const s3 = new AWS.S3({
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
    region: import.meta.env.VITE_AWS_REGION,
});

async function getObjectMetadata(bucket: string, key: string): Promise<string> {
    try {
        const metadata = await s3.headObject({ Bucket: bucket, Key: key }).promise();
        // console.log(metadata.Metadata?.comment)
        return metadata.Metadata?.comment || ''; // Ensure it always returns a string
    } catch (error) {
        console.error(`Error fetching metadata for ${key}:`, error);
        return ''; // Default to an empty string on error
    }
}

async function getFolderComment(bucket: string, folderKey: string): Promise<string> {
    const commentFileKey = `${folderKey}__comment__.txt`;
    try {
        const object = await s3.getObject({ Bucket: bucket, Key: commentFileKey }).promise();
        console.log("COMMENT : " , commentFileKey , object.Body?.toString('utf-8') || '<EMPTY>' )
        return object.Body?.toString('utf-8') || ''; // Convert buffer to string
    } catch (error : any) {
        if (error.code === 'NoSuchKey') {
            console.log(`Comment file not found for folder: ${folderKey}`);
        } else {
            console.error(`Error fetching folder comment for ${folderKey}:`, error);
        }
        return ''; // Default to empty string if the comment file does not exist
    }
}

export const POST: RequestHandler = async ({ request }) => {
    const body = await request.json();
    const { prefix } = body as { prefix: string };

    if (!prefix) {
        return new Response(
            JSON.stringify({ error: 'Prefix is required' }),
            { status: 400 }
        );
    }

    try {
        const params: AWS.S3.ListObjectsV2Request = {
            Bucket: import.meta.env.VITE_AWS_S3_BUCKET,
            Prefix: prefix === '/' ? '' : prefix,
            Delimiter: '/'
        };

        const data = await s3.listObjectsV2(params).promise();

        // Fetch folder comments
        const folders: FolderObject[] = await Promise.all(
            (data.CommonPrefixes || []).map(async folder => ({
                S3Key: folder.Prefix as string,
                comment: await getFolderComment(import.meta.env.VITE_AWS_S3_BUCKET, folder.Prefix as string)
            }))
        );

        // Fetch file metadata comments
        const files: FileObject[] = await Promise.all(
            (data.Contents || []).map(async file => {
                const comment = await getObjectMetadata(import.meta.env.VITE_AWS_S3_BUCKET, file.Key as string);
                return {
                    S3Key: file.Key as string,
                    comment,
                    status: true // Default status (adjust as needed)
                };
            })
        );

        return new Response(
            JSON.stringify([...folders, ...files]),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    } catch (error) {
        console.error('Error fetching S3 objects:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to fetch S3 objects' }),
            { status: 500 }
        );
    }
};
