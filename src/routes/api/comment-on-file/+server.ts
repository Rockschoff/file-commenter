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

export const POST: RequestHandler = async ({ request }) => {
    try {
        // Parse form data
        const formData = await request.formData();
        const comment = formData.get('comment'); // Can be empty but not null
        const key = formData.get('key');


        if (!key || typeof key !== 'string') {
            return new Response(JSON.stringify({ error: 'Invalid key provided' }), { status: 400 });
        }
        if (comment === null || typeof comment !== "string") {
            return new Response(JSON.stringify({ error: 'Comment is required (can be empty)' }), { status: 400 });
        }

        //<TASK> Also add the comment to the s3object.Metadata.comment field. if the metadata.comment does not exist then create  the field, the key is the s3 key
        // Update S3 object metadata
        let metadata: AWS.S3.Metadata = {};
        try {
            const headResponse = await s3.headObject({ Bucket: s3Bucket, Key: key }).promise();
            metadata = headResponse.Metadata || {};
            metadata.comment = comment; // Update or add the comment field
        } catch (err: any) {
            if (err.code === 'NotFound') {
                return new Response(JSON.stringify({ error: 'S3 object not found' }), { status: 404 });
            }
            console.error('Error retrieving S3 object metadata:', err);
            throw err;
        }

        try {
            await s3
                .copyObject({
                    Bucket: s3Bucket,
                    CopySource: `${s3Bucket}/${key}`,
                    Key: key,
                    Metadata: metadata,
                    MetadataDirective: 'REPLACE',
                })
                .promise();
        } catch (err) {
            console.error('Error updating S3 object metadata:', err);
            throw err;
        }

        const basename = path.basename(key);

        // Connect to MongoDB
        await client.connect();
        const database = client.db(mongoDatabase);
        const collection = database.collection(mongoCollection);

        // Update all matching documents without creating new ones
        const updateResult = await collection.updateMany(
            { document_name: basename }, // Filter documents by `document_name`
            { $set: { comment } } // Set the `comment` field to the new value (including empty string)
        );

        console.log(`Update result:`, updateResult);

        // Close MongoDB connection
        await client.close();

        if (updateResult.matchedCount === 0) {
            return new Response(
                JSON.stringify({ message: 'No documents matched the given key' }),
                { status: 404 }
            );
        }

        return new Response(
            JSON.stringify({
                message: 'Comment updated successfully',
                matchedCount: updateResult.matchedCount,
                modifiedCount: updateResult.modifiedCount,
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error while updating the comment:', error);

        return new Response(
            JSON.stringify({
                error: (error as Error).message || 'An error occurred while updating the comment',
            }),
            { status: 500 }
        );
    } finally {
        // Ensure MongoDB connection is closed
        await client.close();
    }
};
