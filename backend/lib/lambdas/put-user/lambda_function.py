import json
import os
import boto3
from botocore.exceptions import ClientError

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
# Get the table name from the environment variable
DDB_USERS = os.environ.get('DDB_TABLE')

# Get the DynamoDB table
table = dynamodb.Table(DDB_USERS)


def lambda_handler(event, context):
    # Parse the JSON body from the event
    try:
        body = json.loads(event['body'])
    except json.JSONDecodeError:
        return {'statusCode': 400, 'body': json.dumps('Invalid JSON')}

    # Extract user information
    user_info = {
        'uid': body.get('uid', ''),
        'email': body.get('email', ''),
        'displayName': body.get('displayName', ''),
        'bio': body.get('bio', ''),
        'country': body.get('country', ''),
    }

    # Update item in DynamoDB
    try:
        response = table.put_item(Item=user_info)
    except ClientError as e:
        return {'statusCode': 500, 'body': json.dumps(e.response['Error']['Message'])}

    return {'statusCode': 200, 'body': json.dumps('User information updated successfully')}
