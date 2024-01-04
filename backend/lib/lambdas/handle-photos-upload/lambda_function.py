import os
import json
import logging
import boto3
from botocore.exceptions import ClientError

# Initialize a DynamoDB client
dynamodb = boto3.resource('dynamodb')
# Get the table name from the environment variable
DDB_USERS = os.environ.get('DDB_TABLE')

# Initialize logger
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    # Parse the JSON body from the event
    try:
        body = json.loads(event['body'])
        uid = body['uid']
        email = body['email']
        logger.info(f'User ID: {uid}, Email: {email}')
    except (KeyError, TypeError, json.JSONDecodeError) as e:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Bad Request: Invalid input'})
        }

    # Get the DynamoDB table
    table = dynamodb.Table(DDB_USERS)

    # Insert item into DynamoDB
    try:
        response = table.get_item(Key={'uid': uid})
        if 'Item' in response:
            return {
                'statusCode': 409,  # Conflict status code
                'body': json.dumps({'error': 'User already exists'})
            }
        response = table.put_item(
            Item={
                'uid': uid,
                'email': email
            }
        )
        logger.info(f'User added successfully: {response}')
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'User added successfully'})
        }
    except ClientError as e:
        logger.error(e.response['Error']['Message'])
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error'})
        }
