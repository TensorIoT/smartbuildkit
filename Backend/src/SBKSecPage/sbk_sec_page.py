import boto3
from botocore.exceptions import ClientError
import time
import json
import os
import decimal
from boto3.dynamodb.conditions import Key, Attr
from datetime import datetime
from datetime import timedelta


dynamodb = boto3.resource('dynamodb')
sbk_device_list_table = dynamodb.Table(os.environ['SBKDeviceListTableName'])
sbk_device_data_table = dynamodb.Table(os.environ['SBKDeviceDataTableName'])
sbk_hourly_device_data_table = dynamodb.Table(os.environ['SBKHourlyDeviceDataTableName'])
sbk_daily_device_data_table = dynamodb.Table(os.environ['SBKDailyDeviceDataTableName'])

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

def get_door_room_device_list(user_id):
    door_device_list = []
    room_device_list = []
    response = sbk_device_list_table.query(
        IndexName="USERID_INDEX",
        ScanIndexForward=True,
        KeyConditionExpression=Key('USERID').eq(user_id)
    )
    print(response)
    for device in response['Items']:
        if device['SENSOR_TYPE'] == 'DOOR':
            door_device_list.append(device)
        if device['SENSOR_TYPE'] == 'ROOM':
            room_device_list.append(device)
    return door_device_list,room_device_list

def process_door_sensor(door_sensor, start_date, end_date):
    dev_eui = door_sensor['DEVEUI']
    device_name = dev_eui
    device_location = dev_eui    
    if 'DEVICE_NAME' in door_sensor:
        device_name = door_sensor['DEVICE_NAME']
    if 'DEVICE_LOCATION' in door_sensor:
        device_location = door_sensor['DEVICE_LOCATION']      
    return_item = {}
    return_item = {
        'DEVEUI': dev_eui,
        'DEVICE_NAME': device_name,
        'DEVICE_LOCATION': device_location,        
        'CURRENT_STATUS': 'CLOSED',
        'STATUS': {}
    }
    if 'open' in door_sensor:
        if door_sensor['open'] == True:
            return_item['CURRENT_STATUS'] = 'OPEN'

    for i in range(24):
        return_item['STATUS'][i] = 'CLOSED'
        
    response = sbk_device_data_table.query(
        ScanIndexForward=True,
        KeyConditionExpression=Key('DEVEUI').eq(dev_eui) & Key('TSTAMP').between(start_date, end_date)
    )
    print(response)
    for item in response['Items']:
        if item['open'] == True:
            record_time_stamp = item['TSTAMP']
            dt_object = datetime.fromtimestamp(record_time_stamp)
            hour_key = dt_object.hour
            return_item['STATUS'][hour_key] = 'OPEN'
    return(return_item)

def process_room_sensor(room_sensor, start_date, end_date):
    dev_eui = room_sensor['DEVEUI']
    device_name = dev_eui
    device_location = dev_eui
    if 'DEVICE_NAME' in room_sensor:
        device_name = room_sensor['DEVICE_NAME']
    if 'DEVICE_LOCATION' in room_sensor:
        device_location = room_sensor['DEVICE_LOCATION']      
    return_item = {}
    return_item = {
        'DEVEUI': dev_eui,
        'DEVICE_NAME': device_name,
        'DEVICE_LOCATION': device_location,        
        'CURRENT_STATUS': 'NO MOTION',
        'STATUS': {}
    }
    if 'motion' in room_sensor:
        if room_sensor['motion'] == True:
            return_item['CURRENT_STATUS'] = 'MOTION'

    for i in range(24):
        return_item['STATUS'][i] = 'NO MOTION'
        
    response = sbk_device_data_table.query(
        ScanIndexForward=True,
        KeyConditionExpression=Key('DEVEUI').eq(dev_eui) & Key('TSTAMP').between(start_date, end_date)
    )
    print(response)
    for item in response['Items']:
        if item['motion'] == True:
            record_time_stamp = item['TSTAMP']
            dt_object = datetime.fromtimestamp(record_time_stamp)
            hour_key = dt_object.hour
            return_item['STATUS'][hour_key] = 'MOTION'
    return(return_item)    
    
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
    
    right_now = datetime.now()
    this_hour = int(datetime.timestamp(datetime(right_now.year, right_now.month, right_now.day, right_now.hour)))
    today = int(datetime.timestamp(datetime(right_now.year, right_now.month, right_now.day)))
    end_date = int(datetime.timestamp(right_now))
    start_date = int(datetime.timestamp(right_now - timedelta(days=1)))

    door_device_list, room_device_list = get_door_room_device_list(user_id)
    print(door_device_list)
    print(room_device_list)
    response_to_user = {
        'DOORS': [],
        'ROOMS': []
    }
    
    for door_sensor in door_device_list:
        response_to_user['DOORS'].append(process_door_sensor(door_sensor, start_date, end_date))

    for room_sensor in room_device_list:
        response_to_user['ROOMS'].append(process_room_sensor(room_sensor, start_date, end_date))
        
    return cors_web_response(200, response_to_user)
