import boto3
import io
import json
import numpy as np
import tensorflow as tf
from PIL import Image
from tensorflow.keras.applications.resnet50 import preprocess_input
import logging

# Initialize logger
logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3_client = boto3.client('s3')


def load_model():
    # Load the ResNet50 model (assumes model is included in the deployment package or Lambda Layer)
    model = tf.keras.applications.ResNet50(
        weights='imagenet', include_top=False)
    model = tf.keras.Model(inputs=model.input, outputs=model.layers[-1].output)
    return model


model = load_model()


def preprocess_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes))
    image = image.resize((224, 224))
    image_array = np.array(image)
    image_array = np.expand_dims(image_array, axis=0)
    image_array = preprocess_input(image_array)
    return image_array


def map_category(index):
    # Mapping of index ranges to broader classes
    class_mapping = {
        range(1, 299): "Animals",          # Animal related classes
        range(300, 400): "Nature",         # Nature related classes
        range(401, 500): "People",         # People related classes
        range(501, 600): "Urban/Cityscapes",  # Urban and cityscapes
        range(601, 700): "Vehicles",       # Vehicles
        range(701, 800): "Food and Drinks",  # Food and drinks
        range(801, 900): "Sports and Recreation",  # Sports and recreation
        range(901, 1000): "Technology and Gadgets",  # Technology and gadgets
        # Art and Culture, Architecture and Interiors can be adjusted similarly
    }

    # Identify and return the broader class for the given index
    for class_range, class_name in class_mapping.items():
        if index in class_range:
            return class_name

    return "Unknown Class"


def move_image(bucket, original_key, category):
    # Construct the new key path
    parts = original_key.split('/')
    parts.insert(2, category)  # Assuming 'user_id/images/image.png' structure
    new_key = '/'.join(parts)

    # Copy the object to the new location
    s3_client.copy_object(Bucket=bucket, CopySource={
                          'Bucket': bucket, 'Key': original_key}, Key=new_key)

    # Delete the original object
    s3_client.delete_object(Bucket=bucket, Key=original_key)

    logger.info(f'Moved {original_key} to {new_key}')
    return new_key


def lambda_handler(event, context):
    try:
        # Extract bucket name and key from the event
        bucket = event['Records'][0]['s3']['bucket']['name']
        key = event['Records'][0]['s3']['object']['key']
        logger.info(f'Processing file {key} from bucket {bucket}.')

        # Verify that the key follows the expected pattern 'user_id/images/image.png'
        if not key.count('/') == 2 or not key.split('/')[1] == 'images':
            logger.info(
                f'File {key} does not match the required pattern. Skipping.')
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': "*"
                },
                'body': json.dumps(f'Skipped processing of {key}')
            }

        # Download the image from S3
        file_byte_string = s3_client.get_object(
            Bucket=bucket, Key=key)['Body'].read()

        # Preprocess the image
        preprocessed_image = preprocess_image(file_byte_string)

        # Make a prediction
        predictions = model.predict(preprocessed_image)
        predicted_class_index = np.argmax(predictions, axis=1)[0]

        # Map the predicted class index to a category
        predicted_category = map_category(predicted_class_index)
        logger.info(f'Predicted category: {predicted_category}')

        # Move the image to the new category-specific location
        new_key = move_image(bucket, key, predicted_category)

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': "*"
            },
            'body': json.dumps(f'Image moved to {new_key}')
        }

    except Exception as e:
        logger.error(f'Error processing image: {str(e)}')
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': "*"
            },
            'body': json.dumps('Error processing the image')
        }
