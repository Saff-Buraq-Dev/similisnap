// upload.ts
import axios from 'axios';

interface PresignedPostData {
    url: string;
    fields: {
        [key: string]: string;
    };
}

// Function to get the presigned URL from your API
export async function getPresignedUrl(file: File, userId: string, key: string): Promise<PresignedPostData> {
    try {
        const response = await axios.post('/upload', {
            name: file.name,
            uid: userId,
            key: key
        });

        if (response.data.error) {
            throw new Error(response.data.message);
        }

        return response.data.data;
    } catch (error) {
        console.error('Error getting presigned URL', error);
        throw error;
    }
}

// Function to upload a file to S3
export async function uploadFileToS3(file: File, presignedPostData: PresignedPostData): Promise<void> {
    const formData = new FormData();

    Object.entries(presignedPostData.fields).forEach(([key, value]) => {
        formData.append(key, value);
    });

    formData.append('file', file);

    try {
        await axios.post(presignedPostData.url, formData);
        console.log('File uploaded:', file.name);
    } catch (error) {
        console.error('Error uploading to S3', error);
        throw error;
    }
}

// Function to handle the upload of multiple files
export async function uploadFiles(files: FileList, userId: string, key: string): Promise<void> {
    const allowedMimeTypes = ['image/jpeg', 'image/png'];
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!allowedMimeTypes.includes(file.type)) {
            console.error('File type not allowed:', file.type);
            continue;
        }

        if (file.size > maxFileSize) {
            console.error('File size exceeds limit:', file.size);
            continue;
        }

        try {
            const presignedData = await getPresignedUrl(file, userId, key);
            await uploadFileToS3(file, presignedData);
        } catch (error) {
            console.error('Error in file upload', error);
        }
    }
}
