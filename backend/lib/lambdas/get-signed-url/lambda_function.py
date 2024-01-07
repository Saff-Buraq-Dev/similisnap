import json
import os
import logging
import boto3
import uuid
import mimetypes
from botocore.exceptions import ClientError

s3_client = boto3.client('s3')

BUCKET_NAME = os.environ.get('BUCKET_NAME')

# Initialize logger
logger = logging.getLogger()
logger.setLevel(logging.INFO)


def lambda_handler(event, context):
    logger.info(event)
    return get_presigned_post_data(event)


def create_presigned_post(bucket_name, key, expiration=60*3):
    """Generate a presigned URL S3 POST request to upload a file with size restrictions."""
    try:
        response = s3_client.generate_presigned_post(
            Bucket=bucket_name,
            Key=f"{key}/${{filename}}",
            Conditions=[["starts-with", "$key", f"{key}/"]],
            ExpiresIn=expiration
        )
    except ClientError as e:
        raise e

    return response


def get_presigned_post_data(event):
    """Handle the request to get the presigned URL."""
    try:
        body = json.loads(event['body'])
        file_name = body['name']
        user_id = body['uid']
        key = body['key']
        logger.info(f'Key: {key}')
        logger.info(f'File name: {file_name}')
        logger.info(f'User ID: {user_id}')

        content_type = mimetypes.guess_type(
            file_name)[0] or 'application/octet-stream'
        logger.info(f'Content type: {content_type}')

        # Define allowed image MIME types
        allowed_mime_types = ["image/jpeg", "image/png"]
        # Check if the file's MIME type is in the allowed list
        if content_type not in allowed_mime_types:
            return {
                "statusCode": 400,  # Bad Request
                'headers': {
                    'Access-Control-Allow-Origin': "*"
                },
                "body": json.dumps({
                    "error": True,
                    "data": None,
                    "message": "File type not allowed. Only image files are permitted."
                })
            }
        presigned_post_data = create_presigned_post(
            bucket_name=BUCKET_NAME,
            key=f'{user_id}/{key}'
        )

        return {
            "statusCode": 200,
            'headers': {
                'Access-Control-Allow-Origin': "*"
            },
            "body": json.dumps({
                "error": False,
                "data": presigned_post_data,
                "message": None
            })
        }

    except Exception as e:
        logger.error(e)
        return {
            "statusCode": 500,
            'headers': {
                'Access-Control-Allow-Origin': "*"
            },
            "body": json.dumps({
                "error": True,
                "data": None,
                "message": str(e)
            })
        }


# Example usage
if __name__ == "__main__":
    # Mock event object
    event = {
        'body': json.dumps({'name': 'example.png'})
    }

    response = get_presigned_post_data(event)
    print(response)
