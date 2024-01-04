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
    # Get the 'uid' from the path parameter
    uid = event['pathParameters']['uid']

    # Fetch item from DynamoDB
    try:
        response = table.get_item(Key={'uid': uid})
    except ClientError as e:
        return {'statusCode': 500, 'body': json.dumps(e.response['Error']['Message'])}

    # Check if user was found
    if 'Item' in response:
        return {'statusCode': 200, 'body': json.dumps(response['Item'])}
    else:
        return {'statusCode': 404, 'body': json.dumps('User not found')}

