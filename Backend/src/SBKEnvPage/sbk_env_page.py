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

def get_device_list(user_id, device_type):
    device_list = []
    response = sbk_device_list_table.query(
        IndexName="USERID_INDEX",
        ScanIndexForward=True,
        KeyConditionExpression=Key('USERID').eq(user_id)
    )
    print(response)
    for device in response['Items']:
        if device['SENSOR_TYPE'] == device_type:
            device_list.append(device)

    return device_list
    
def process_env_sensor(env_sensor, start_date, end_date):
    dev_eui = env_sensor['DEVEUI']
    device_name = dev_eui
    device_location = dev_eui
    if 'DEVICE_NAME' in env_sensor:
        device_name = env_sensor['DEVICE_NAME']
    if 'DEVICE_LOCATION' in env_sensor:
        device_location = env_sensor['DEVICE_LOCATION']        
    return_item = {}
    return_item = {
        'DEVEUI': dev_eui,
        'DEVICE_NAME': device_name,
        'DEVICE_LOCATION': device_location,
        'TEMP_TYPE': 'F',
        'CURRENT_STATUS': 'N/A',
        'STATUS': {}
    }
    if 'temp' in env_sensor:
        if env_sensor['LAST_MESSAGE'] > start_date:
            if env_sensor['temp'] > 0:
                env_sensor['temp'] = round(int(env_sensor['temp']) * 1.8 + 32)
            return_item['CURRENT_STATUS'] = env_sensor['temp']

    for i in range(24):
        return_item['STATUS'][i] = {
            'TEMP': 0,
            'HUMIDITY': 0
        }
        
    response = sbk_device_data_table.query(
        ScanIndexForward=True,
        KeyConditionExpression=Key('DEVEUI').eq(dev_eui) & Key('TSTAMP').between(start_date, end_date)
    )
    print(response)
    for item in response['Items']:
        record_time_stamp = item['TSTAMP']
        dt_object = datetime.fromtimestamp(record_time_stamp)
        hour_key = dt_object.hour
        if item['temp'] > 0:
            item['temp'] = round(int(item['temp']) * 1.8 + 32)
        if 'temp' in item and 'humidity' in item:
            return_item['STATUS'][hour_key] = {
                'TEMP': item['temp'],
                'HUMIDITY': item['humidity']
            }
    return(return_item)

def process_leak_sensor(leak_sensor, start_date, end_date):
    print("I am in leak sensor processing")
    dev_eui = leak_sensor['DEVEUI']
    device_name = dev_eui
    device_location = dev_eui
    if 'DEVICE_NAME' in leak_sensor:
        device_name = leak_sensor['DEVICE_NAME']
    if 'DEVICE_LOCATION' in leak_sensor:
        device_location = leak_sensor['DEVICE_LOCATION']        
    return_item = {}
    return_item = {
        'DEVEUI': dev_eui,
        'DEVICE_NAME': device_name,
        'DEVICE_LOCATION': device_location,
        'CURRENT_STATUS': 'N/A',
        'STATUS': {}
    }
    if 'status' in leak_sensor:
        if leak_sensor['LAST_MESSAGE'] > start_date:
            return_item['CURRENT_STATUS'] = 'NO LEAK'
            if leak_sensor['status'] == 'water present':
                return_item['CURRENT_STATUS'] = 'LEAK'

    for i in range(24):
        return_item['STATUS'][i] = {
            'LEAK': 0
        }
        
    response = sbk_device_data_table.query(
        ScanIndexForward=True,
        KeyConditionExpression=Key('DEVEUI').eq(dev_eui) & Key('TSTAMP').between(start_date, end_date)
    )
    print(response)
    for item in response['Items']:
        record_time_stamp = item['TSTAMP']
        dt_object = datetime.fromtimestamp(record_time_stamp)
        hour_key = dt_object.hour
        if item['leak']:
            return_item['STATUS'][hour_key] = {
                'LEAK': 1
            }
    return(return_item)

def compute_env_average(response_to_user):
    for i in range(24):
        response_to_user['ENVAVERAGE'][i] = {
            'TEMP': 0,
            'HUMIDITY': 0
        }
    number_of_env_sensors = len(response_to_user['ENVS'])
    for i in range(24):
        sum_of_temp = 0
        sum_of_humidity = 0
        counter = 0
        response_to_user['ENVAVERAGE'][i] = {
            'TEMP': 0,
            'HUMIDITY': 0
        }
        for j in range(number_of_env_sensors):
            if response_to_user['ENVS'][j]['STATUS'][i]['TEMP'] > 0:
                counter = counter + 1
            sum_of_temp = sum_of_temp + response_to_user['ENVS'][j]['STATUS'][i]['TEMP']
            sum_of_humidity = sum_of_humidity + response_to_user['ENVS'][j]['STATUS'][i]['HUMIDITY']
        if counter > 0:
            response_to_user['ENVAVERAGE'][i] = {
                'TEMP': int(sum_of_temp/counter),
                'HUMIDITY': int(sum_of_humidity/counter)
            }
    return response_to_user

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

    env_device_list = get_device_list(user_id, 'ENV')
    leak_device_list = get_device_list(user_id, 'LEAK')

    print(env_device_list)
    print(leak_device_list)

    response_to_user = {
        'ENVS': [],
        'ENVAVERAGE': {},
        'LEAKS': []
    }
    
    for env_sensor in env_device_list:
        response_to_user['ENVS'].append(process_env_sensor(env_sensor, start_date, end_date))

    for leak_sensor in leak_device_list:
        response_to_user['LEAKS'].append(process_leak_sensor(leak_sensor, start_date, end_date))

    response_to_user = compute_env_average(response_to_user)

    return cors_web_response(200, response_to_user)