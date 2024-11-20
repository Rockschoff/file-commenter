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

// Global MongoDB client
let mongoClient: MongoClient | null = null;

async function getMongoClient() {
    console.log("here")
    if (!mongoClient) {
        mongoClient = new MongoClient(mongoUri);
        await mongoClient.connect();
    }
    return mongoClient;
}

export const POST: RequestHandler = async ({ request }) => {
    console.log(request)
    try {
        const body = await request.json(); // Parse JSON body
        const key = body.key;

        console.log(key)

        if (!key || typeof key !== 'string') {
            return new Response(
                JSON.stringify({ error: 'Key value not provided or is in incorrect format. Key must be a string.' }),
                { status: 400 }
            );
        }

        const basename = path.basename(key);

        // Check if the file exists in S3
        let s3Exists = false;
        try {
            await s3.headObject({ Bucket: s3Bucket, Key: key }).promise();
            s3Exists = true;
        } catch (err: any) {
            if (err.code !== 'NotFound') {
                console.error(`S3 error for key ${key}:`, err);
                throw err;
            }
        }

        // Check if there are documents in MongoDB with document_name == basename
        let mongoExists = false;
        try {
            const client = await getMongoClient();
            console.log("client " , key)
            const database = client.db(mongoDatabase);
            console.log("db " , key)
            const collection = database.collection(mongoCollection);
            console.log("collection " , key)
            console.log("here")
            const document = await collection.findOne({ document_name: basename });
            if (document) {
                mongoExists = true;
            }
        } catch (err) {
            console.error('MongoDB error:', err);
            throw err;
        }
        console.log(s3Exists , mongoExists)
        // Return true if both checks are true, otherwise return false
        return new Response(
            JSON.stringify({ exists: s3Exists && mongoExists }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error processing the request:', error);
        return new Response(
            JSON.stringify({ error: 'An error occurred while processing the request.' }),
            { status: 500 }
        );
    }
};
