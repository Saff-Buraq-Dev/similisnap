import os
import json
import logging
import boto3
from botocore.exceptions import ClientError

# Initialize a DynamoDB client
dynamodb = boto3.resource('dynamodb')
# Get the table name from the environment variable
DDB_USERS = os.environ.get('DDB_TABLE')

# Get the DynamoDB table
table = dynamodb.Table(DDB_USERS)

# Initialize logger
logger = logging.getLogger()
logger.setLevel(logging.INFO)


def lambda_handler(event, context):
    # Parse the JSON body from the event
    try:
        body = json.loads(event['body'])
        uid = body['uid']
        email = body['email']
        display_name = body['displayName']
        logger.info(
            f'User ID: {uid}, Email: {email}, DisplayName: {display_name}')
    except (KeyError, TypeError, json.JSONDecodeError) as e:
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': "*"
            },
            'body': json.dumps({'error': 'Bad Request: Invalid input'})
        }

    # Insert item into DynamoDB
    try:
        response = table.get_item(Key={'uid': uid})
        if 'Item' in response:
            return {
                'statusCode': 409,  # Conflict status code
                'headers': {
                    'Access-Control-Allow-Origin': "*"
                },
                'body': json.dumps({'error': 'User already exists'})
            }
        logger.info(f'User does not exist, adding user...')
        response = table.put_item(
            Item={
                'uid': uid,
                'email': email,
                'displayName': display_name,
                'bio': '',
                'country': ''
            }
        )
        logger.info(f'User added successfully: {response}')
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': "*"
            },
            'body': json.dumps({'message': 'User added successfully'})
        }
    except ClientError as e:
        logger.error(e.response['Error']['Message'])
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': "*"
            },
            'body': json.dumps({'error': 'Internal server error'})
        }
