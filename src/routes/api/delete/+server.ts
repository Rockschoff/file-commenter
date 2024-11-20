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
        const { keys } = await request.json();

        if (!keys || keys.length === 0) {
            return new Response(JSON.stringify({ error: 'No filenames provided' }), { status: 400 });
        }

        console.log(`Deleting files: ${keys.join(', ')}`);

        // Delete files from S3
        const s3DeleteParams = {
            Bucket: s3Bucket,
            Delete: {
                Objects: keys.map((key :string) => ({ Key: key })),
                Quiet: true, // Suppress success/failure for each object
            },
        };

        const s3DeleteResponse = await s3.deleteObjects(s3DeleteParams).promise();
        console.log(`Successfully deleted files from S3:`, s3DeleteResponse);

        //get the basename of the files from the s3 key path
        const basenames = keys.map((key : string) => path.basename(key));
        //use the base as document_name in mongodb

        // Delete records from MongoDB
        await client.connect();
        const database = client.db(mongoDatabase);
        const collection = database.collection(mongoCollection);

        const deleteResult = await collection.deleteMany({
            document_name: { $in: basenames },
        });

        console.log(
            `Successfully deleted ${deleteResult.deletedCount} records from MongoDB`
        );

        // Close MongoDB connection
        await client.close();

        return new Response(
            JSON.stringify({
                message: 'Files deleted successfully from S3 and MongoDB',
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in deletion process:', error);

        return new Response(
            JSON.stringify({
                error: (error as Error).message || 'An error occurred during deletion',
            }),
            { status: 500 }
        );
    }
};
