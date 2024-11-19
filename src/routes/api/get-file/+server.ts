import AWS from 'aws-sdk';
import type { RequestHandler } from '@sveltejs/kit';

const s3 = new AWS.S3({
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
    region: import.meta.env.VITE_AWS_REGION,
});

const s3Bucket = import.meta.env.VITE_AWS_S3_BUCKET as string;

export const POST: RequestHandler = async ({ request }) => {
    const formData = await request.formData();
    const fileKey = formData.get('file_key');

    if (!fileKey || typeof fileKey !== 'string') {
        return new Response(
            JSON.stringify({ error: 'file_key not found or in wrong format' }),
            { status: 400 }
        );
    }

    console.log(fileKey);

    try {
        // Get file metadata
        const head = await s3
            .headObject({ Bucket: s3Bucket, Key: fileKey })
            .promise();
        const contentType = head.ContentType;

        console.log(`Content Type from S3: ${contentType}`);

        // Check if the file is a PDF by content type or file extension
        if (
            contentType !== 'application/pdf' &&
            !fileKey.toLowerCase().endsWith('.pdf')
        ) {
            return new Response(
                JSON.stringify({ error: 'File is not a PDF' }),
                { status: 400 }
            );
        }

        // Get the file
        const file = await s3.getObject({ Bucket: s3Bucket, Key: fileKey }).promise();

        if (!file.Body) {
            return new Response(
                JSON.stringify({ error: 'File body is empty' }),
                { status: 404 }
            );
        }

        // Ensure file.Body is in a format compatible with Response
        const body =
            file.Body instanceof Buffer
                ? file.Body
                : new Blob([file.Body as Uint8Array]);

        return new Response(body, {
            headers: {
                'Content-Type': 'application/pdf', // Override to ensure it's treated as a PDF
                'Content-Disposition': `inline; filename="${fileKey}"`,
            },
        });
    } catch (err: any) {
        console.error('Error fetching file from S3:', err);
        return new Response(
            JSON.stringify({ error: 'Error fetching file' }),
            { status: 500 }
        );
    }
};
