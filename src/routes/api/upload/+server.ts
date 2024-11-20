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

        // const response = fetch(url, {
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
        const formData = await request.formData();

        const bucket = import.meta.env.VITE_AWS_S3_BUCKET as string;
        if (!bucket) {
            throw new Error('S3 bucket name is not defined in environment variables.');
        }

        // Extract the `level` parameter
        const levelInput = formData.get('level')?.toString() || ""
        const level = levelInput==="/"?"":levelInput
        console.log("LEVEL is " ,level )
        // Process each file in the form data
        for (const [fieldName, file] of formData.entries()) {
            if (file instanceof File) {
                // Reconstruct full file path including folder structure
                const folderPath = fieldName === 'folder' ? path.dirname(file.webkitRelativePath || file.name) : '';
                const s3Key = path.join(level, file.name);
                console.log(s3Key , level , file.name)
                const filePath = path.join('/tmp', file.name);

                // Ensure directory structure exists
                const dirPath = path.dirname(filePath);
                await fs.mkdir(dirPath, { recursive: true });

                console.log('Writing the file to', filePath);

                // Write the file to /tmp
                const arrayBuffer = await file.arrayBuffer();
                await fs.writeFile(filePath, Buffer.from(arrayBuffer));

                console.log('Done writing the file to', filePath);

                

                // Send for processing
                await sendFileForProcessing(filePath, path.basename(s3Key));

                // Upload to S3
                await uploadToS3(bucket, s3Key, filePath);

                // Clean up the temporary file
                await fs.unlink(filePath);
            }
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
