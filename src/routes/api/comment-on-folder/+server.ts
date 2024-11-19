import type { RequestHandler } from '@sveltejs/kit';
import AWS from 'aws-sdk';
import { MongoClient } from 'mongodb';
import path from 'path';

// AWS S3 Configuration
const s3 = new AWS.S3({
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
    region: import.meta.env.VITE_AWS_REGION,
});

const s3Bucket = import.meta.env.VITE_AWS_S3_BUCKET as string;

// MongoDB Configuration
const mongoUri = import.meta.env.VITE_MONGODB_URI as string;
const mongoDatabase = import.meta.env.VITE_MONGODB_DATABASE as string;
const mongoCollection = import.meta.env.VITE_MONGODB_COLLECTION as string;

// Create MongoDB client
const client = new MongoClient(mongoUri);

export const POST: RequestHandler = async ({ request, fetch }) => {
    const formData = await request.formData();
    const folderKey = formData.get('key');
    if (!folderKey || typeof folderKey !== 'string') {
        return new Response(
            'No folder key was provided, or it was in the wrong format',
            { status: 400 }
        );
    }
    const comment = formData.get('comment');
    if (typeof comment !== 'string') {
        return new Response(
            'Comment was not provided or was in the wrong format',
            { status: 400 }
        );
    }

    let fileList: string[] = [];
    try {
        // Fetch files with the prefix
        const response = await fetch('/api/get-all-files-with-prefix', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prefix : folderKey }),
        });

        if (response.ok) {
            const data = await response.json();
            if (data.keys && Array.isArray(data.keys)) {
                fileList = data.keys;
            } else {
                console.error('Unexpected response format:', data);
                throw new Error('Unexpected response format');
            }
        } else {
            console.error('Failed to fetch file list:', response.statusText , response);
            throw new Error('Failed to fetch file list');
        }
    } catch (err) {
        console.error('Error occurred while listing the files:', err);
        return new Response(
            JSON.stringify({ error: 'Error occurred while listing the files' }),
            { status: 500 }
        );
    }

    const basenames = fileList.map((key) => path.basename(key));

    try {
        // Handle S3 comment file update
        const commentFileKey = `${folderKey}/__comment__.txt`;

        // Delete old comment file if it exists
        try {
            await s3
                .headObject({ Bucket: s3Bucket, Key: commentFileKey })
                .promise();
            await s3
                .deleteObject({ Bucket: s3Bucket, Key: commentFileKey })
                .promise();
            console.log('Deleted old comment file:', commentFileKey);
        } catch (err) {
            console.log('Comment file does not exist, skipping deletion');
        }

        // Create new comment file
        await s3
            .putObject({
                Bucket: s3Bucket,
                Key: commentFileKey,
                Body: comment,
                ContentType: 'text/plain',
            })
            .promise();
        console.log('Uploaded new comment file:', commentFileKey);

        // Update MongoDB documents
        await client.connect();
        const database = client.db(mongoDatabase);
        const collection = database.collection(mongoCollection);

        const updateResult = await collection.updateMany(
            { document_name: { $in: basenames } }, // Match documents by basenames
            { $set: { [`folder_comments.${folderKey}`]: comment } } // Update or create folder_comments[folderKey]
        );

        console.log(
            `Updated ${updateResult.modifiedCount} documents in MongoDB`
        );

        await client.close();

        return new Response(
            JSON.stringify({
                message: 'Successfully updated comments in S3 and MongoDB',
                modifiedCount: updateResult.modifiedCount,
            }),
            { status: 200 }
        );
    } catch (err) {
        console.error('Error occurred during the update process:', err);
        return new Response(
            JSON.stringify({ error: 'Error occurred during the update process' }),
            { status: 500 }
        );
    }
};
