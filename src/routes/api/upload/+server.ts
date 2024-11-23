import AWS from 'aws-sdk';
import type { RequestHandler } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';

// Configure AWS S3
const s3 = new AWS.S3({
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
    region: import.meta.env.VITE_AWS_REGION,
});

async function listFilesInS3(bucket: string): Promise<string[]> {
    try {
        const params: AWS.S3.ListObjectsV2Request = {
            Bucket: bucket,
        };

        const data = await s3.listObjectsV2(params).promise();
        const fileKeys = data.Contents?.map((item) => item.Key || '') || [];

        console.log('Files in S3 bucket:', fileKeys);
        return fileKeys;
    } catch (error) {
        console.error('Error listing files in S3:', error);
        throw new Error('Failed to list files in S3.');
    }
}

async function verifyFileInS3(bucket: string, fileKey: string): Promise<boolean> {
    const fileKeys = await listFilesInS3(bucket);

    if (fileKeys.includes(fileKey)) {
        console.log(`File "${fileKey}" exists in the S3 bucket.`);
        return true;
    } else {
        console.error(`File "${fileKey}" does not exist in the S3 bucket.`);
        return false;
    }
}


// Helper function to upload a file to S3
async function uploadToS3(bucket: string, key: string, filePath: string): Promise<void> {
    const fileContent = await fs.readFile(filePath);
    const params: AWS.S3.PutObjectRequest = {
        Bucket: bucket,
        Key: key,
        Body: fileContent,
    };

    try {
        await s3.upload(params).promise();
        console.log(`Successfully uploaded ${key}`);
    } catch (error) {
        console.error(`Error uploading ${key}:`, error);
        throw new Error(`Failed to upload ${key}`);
    }
}

// Helper function to send files for processing
async function sendFileForProcessing(filePath: string, filename: string): Promise<void> {
    const url = "http://localhost:8888/api/upload-file/";
    try {
        const fileContent = await fs.readFile(filePath);
        const formData = new FormData();
        formData.append("file", new Blob([fileContent]), filename);

        console.log(`Sending file ${filename} for processing...`);

        // const response = await fetch(url, {
        //     method: "POST",
        //     body: formData,
        // });

        // if (response.ok) {
        //     console.log(`File ${filename} sent for processing successfully.`);
        // } else {
        //     console.error(
        //         `Failed to send file ${filename} for processing: Status ${response.status}`
        //     );
        // }
    } catch (error) {
        console.error(`Error sending file ${filename} for processing:`, error);
    }
}

// API handler
export const POST: RequestHandler = async ({ request }) => {
    try {
        // Ensure the request is JSON
        if (request.headers.get('Content-Type') !== 'application/json') {
            return new Response(
                JSON.stringify({ error: 'Invalid content type. Expected application/json' }),
                { status: 400 }
            );
        }

        
        const data = await request.json();

        const bucket = import.meta.env.VITE_AWS_S3_BUCKET as string;
        if (!bucket) {
            throw new Error('S3 bucket name is not defined in environment variables.');
        }

        // Extract `level` and `files` from the request JSON
        const level = data.level || "";
        const files = data.files; // `files` should be an array of { name, content (base64) }
        
        if (!Array.isArray(files) || files.length === 0) {
            throw new Error('No files provided.');
        }

        console.log("LEVEL is", level);

        for (const file of files) {
            if (!file.name || !file.content) {
                throw new Error('Each file must have a name and content.');
            }

            let filename : string = file.name

            const s3Key = level==""?filename.substring(1):path.join(level, file.name);
            console.log("Processing file:", s3Key, level, file.name , level=="");

            const filePath = path.join('/tmp', file.name);

            // Ensure directory structure exists
            const dirPath = path.dirname(filePath);
            await fs.mkdir(dirPath, { recursive: true });

            console.log('Writing the file to', filePath);

            // Decode base64 content and write the file to /tmp
            const buffer = Buffer.from(file.content, 'base64');
            await fs.writeFile(filePath, buffer);

            console.log('Done writing the file to', filePath);

            // Send for processing
            await sendFileForProcessing(filePath, path.basename(s3Key));

            // Upload to S3
            await uploadToS3(bucket, s3Key, filePath);
            const exists = await verifyFileInS3(bucket, s3Key);
            if (!exists) {
                console.log("File not uploaded in the s3")
                throw new Error(`File verification failed: "${s3Key}" not found in S3.`);
            }

            // Clean up the temporary file
            await fs.unlink(filePath);
        }

        return new Response(
            JSON.stringify({ message: 'Files uploaded successfully and sent for processing' }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in upload process:', error);
        return new Response(
            JSON.stringify({ error: (error as Error).message || 'Failed to upload' }),
            { status: 500 }
        );
    }
};
