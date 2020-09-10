import boto3
from botocore.exceptions import ClientError
import time
import json
import os
import decimal
from boto3.dynamodb.conditions import Key, Attr


dynamodb = boto3.resource('dynamodb')
sbk_device_list_table = dynamodb.Table(os.environ['SBKDeviceListTableName'])

def cors_web_response(status_code, body):
    return {
        'statusCode': status_code,
        "headers": {
            "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Amz-Date,X-API-Key,X-Api-Key,X-Amz-Security-Token",
            "Access-Control-Allow-Methods": "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT",
            "Access-Control-Allow-Origin": "*"
        },
        'body': json.dumps(body)
    }

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

    rssi = event['rssi']
    dev_eui = event['DEVEUI']
    
    try:
        response = sbk_device_list_table.get_item(Key={'DEVEUI': dev_eui})
    except ClientError as e:
        print(e.response['Error']['Message'])
        return cors_web_response(400, e.response['Error'])
    
    if 'Item' not in response:
        return ''
    
    print(response['Item'])
    
    item = response['Item']
    item['rssi'] = rssi
    
    try:
        response = sbk_device_list_table.put_item(Item=item)
    except ClientError as e:
        print(e.response['Error']['Message'])
        return cors_web_response(400, e.response['Error'])    
    
    return ''