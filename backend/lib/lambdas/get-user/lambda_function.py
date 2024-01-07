import json
import os
import logging
import boto3
from botocore.exceptions import ClientError

# Initialize DynamoDB and s3 clients
dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')
# Get the table and bucket names from the environment variable
DDB_USERS = os.environ.get('DDB_TABLE')
BUCKET_NAME = os.environ.get('BUCKET_NAME')

# Get the DynamoDB table
table = dynamodb.Table(DDB_USERS)

# Initialize logger
logger = logging.getLogger()
logger.setLevel(logging.INFO)


def check_profile_pic_exists(uid):
    file_extensions = ['png', 'jpg', 'jpeg']
    for ext in file_extensions:
        key = f'{uid}/profile/profile_pic.{ext}'
        try:
            s3.head_object(Bucket=BUCKET_NAME, Key=key)
            return True
        except ClientError as e:
            if e.response['Error']['Code'] != '404':
                logger.info(f"Error checking file: {e}")
    return False


def get_image_count(uid):
    prefix = f'{uid}/images/'
    paginator = s3.get_paginator('list_objects_v2')
    page_iterator = paginator.paginate(Bucket=BUCKET_NAME, Prefix=prefix)

    count = 0
    for page in page_iterator:
        count += len(page.get('Contents', []))

    return count


def lambda_handler(event, context):
    # Get the 'uid' from the path parameter
    uid = event['pathParameters']['uid']

    # Fetch item from DynamoDB
    try:
        response = table.get_item(Key={'uid': uid})
    except ClientError as e:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': "*"
            },
            'body': json.dumps(e.response['Error']['Message'])
        }

    user_data = response.get('Item')
    logger.info(f'User data: {user_data}')
    if not user_data:
        return {'statusCode': 404, 'body': json.dumps('User not found')}

    # Check for profile picture
    profile_pic_exists = check_profile_pic_exists(uid)
    logger.info(f'Profile picture exists: {profile_pic_exists}')

    # Get the count of images
    image_count = get_image_count(uid)
    logger.info(f'Image count: {image_count}')

    # Add additional information to user data
    user_data['profilePicExists'] = profile_pic_exists
    user_data['imageCount'] = image_count

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': "*"
        },
        'body': json.dumps(user_data)
    }
