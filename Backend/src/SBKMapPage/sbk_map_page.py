import boto3
from botocore.exceptions import ClientError
import time
import json
import os
import decimal
from boto3.dynamodb.conditions import Key, Attr
import uuid

dynamodb = boto3.resource('dynamodb')
sbk_device_list_table = dynamodb.Table(os.environ['SBKDeviceListTableName'])
sbk_user_list_table = dynamodb.Table(os.environ['SBKUserListTableName'])
map_s3_bucket_name = os.environ['SBKMapS3BucketName']


class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            if o % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)
        
def cors_web_response(status_code, body):
    return {
        'statusCode': status_code,
        "headers": {
            "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Amz-Date,X-API-Key,X-Api-Key,X-Amz-Security-Token",
            "Access-Control-Allow-Methods": "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT",
            "Access-Control-Allow-Origin": "*"
        },
        'body': json.dumps(body, cls=DecimalEncoder)
    }

def upload_map_processor(user_id):
    s3_file_name = str(uuid.uuid4())
    s3_client = boto3.client('s3')
    response = s3_client.generate_presigned_url('put_object',
                                                Params={'Bucket': map_s3_bucket_name,
                                                        'Key': s3_file_name},
                                                ExpiresIn=64000)
    user_item = {
        'USERID': user_id,
        'MAP_NAME': s3_file_name,
        'BUCKET_NAME': map_s3_bucket_name
    }
    db_response = sbk_user_list_table.put_item(Item=user_item)
    return response
    
def get_map_processor(user_id):
    response = sbk_user_list_table.get_item(Key={'USERID': user_id})
    print(response['Item'])
    item = response['Item']
    s3_file_name = str(uuid.uuid4())
    s3_client = boto3.client('s3')
    response = s3_client.generate_presigned_url('get_object',
                                                Params={'Bucket': item['BUCKET_NAME'],
                                                        'Key': item['MAP_NAME']},
                                                ExpiresIn=64000)
    return response    

def upload_points_processor(user_id, params):
    for device in params:
        print("Processing Device = "+device['DEVEUI'])
        response = sbk_device_list_table.get_item(Key={'DEVEUI': device['DEVEUI']})
        print(response)
        item = response['Item']
        print(item)
        item['mapXCoordinate'] = device['mapXCoordinate']
        item['mapYCoordinate'] = device['mapYCoordinate']
        print(item)
        response = sbk_device_list_table.put_item(Item=item)
        print(item)
        
def get_map_sensors(user_id):
    response_array = []
    
    response = sbk_device_list_table.query(
        IndexName="USERID_INDEX",
        KeyConditionExpression=Key('USERID').eq(user_id),
    )
    print("The query returned the following items:")
    for item in response['Items']:
        print(item)
        array_item = {
            'mapXCoordinate': 0,
            'mapYCoordinate': 0
        }
        array_item['DEVEUI'] = item['DEVEUI']
        array_item['DEVICE_NAME'] = item['DEVICE_NAME']
        array_item['SENSOR_TYPE'] = item['SENSOR_TYPE']
        if 'DEVICE_LOCATION' in item:
            array_item['DEVICE_LOCATION'] = item['DEVICE_LOCATION']
        else:
            array_item['DEVICE_LOCATION'] = item['DEVICE_NAME']
        if 'mapXCoordinate' in item:
            array_item['mapXCoordinate'] = item['mapXCoordinate']
        if 'mapYCoordinate' in item:
            array_item['mapYCoordinate'] = item['mapYCoordinate']
        if array_item['SENSOR_TYPE'] == 'ENV':
            if 'temp' in item:
                array_item['DEVICE_NAME'] = array_item['DEVICE_NAME'] + ' - '+ str(item['temp'])
        if array_item['SENSOR_TYPE'] == 'DOOR':
            if 'open' in item:
                array_item['DEVICE_NAME'] = array_item['DEVICE_NAME'] + ' - '+ str(item['open'])
        if array_item['SENSOR_TYPE'] == 'LEAK':
            if 'leak' in item:
                array_item['DEVICE_NAME'] = array_item['DEVICE_NAME'] + ' - '+ str(item['leak'])
        if array_item['SENSOR_TYPE'] == 'DESK':
            if 'motion' in item:
                array_item['DEVICE_NAME'] = array_item['DEVICE_NAME'] + ' - '+ str(item['motion'])
        if array_item['SENSOR_TYPE'] == 'ROOM':
            if 'motion' in item:
                array_item['DEVICE_NAME'] = array_item['DEVICE_NAME'] + ' - '+ str(item['motion'])
        if array_item['SENSOR_TYPE'] == 'GRIDEYE':
            if 'count_0' in item:
                array_item['DEVICE_NAME'] = array_item['DEVICE_NAME'] + ' - '+ str(item['count_0'])
        response_array.append(array_item)
    return response_array

def get_user_id_from_event(event):
    incoming_user_id = None
    try:
        print(event['requestContext']['authorizer']['claims']['cognito:username'])
        incoming_user_id = event['requestContext']['authorizer']['claims']['cognito:username']
    except Exception as e:
        print(e)
        return cors_web_response(400, {'Error': 'getting user id from cognito'})

    if incoming_user_id is None:
        return cors_web_response(400, {'Error': 'missing user id in cognito'})
    user_id = incoming_user_id.upper()
    return user_id
    
def lambda_handler(event, context):
    # TODO implement
    print(event)

    user_id = get_user_id_from_event(event)
    if 'statusCode' in user_id:
        return user_id

    if event['body'] is None:
        return cors_web_response(400, {'Error': 'Missing Body'})
    try:
        incoming_body = json.loads(event['body'])
    except:
        return cors_web_response(400, {'Error': 'body not in json'})
    
    print(incoming_body)

    if 'ACTION' not in incoming_body:
        return cors_web_response(400, {'Error': 'Must provide ACTION'})

    return_json = {'RETURN': 'SUCCESS'}
    
    if incoming_body['ACTION'] == 'UPLOADMAP':
        return_json = upload_map_processor(user_id)

    if incoming_body['ACTION'] == 'GETMAP':
        return_json = get_map_processor(user_id)
        
    if incoming_body['ACTION'] == 'UPLOADPOINTS':
        if 'PARAMS' not in incoming_body:
            return cors_web_response(400, {'Error': 'Must provide PARAMS'})        
        upload_points_processor(user_id, incoming_body['PARAMS'])
        
    if incoming_body['ACTION'] == 'GETSENSORS':
        return_json = get_map_sensors(user_id)
    
    return cors_web_response(200, return_json)
