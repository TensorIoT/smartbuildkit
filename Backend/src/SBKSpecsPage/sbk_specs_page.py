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
    
def get_device_list_by_sensor_type(user_id, sensor_type):
    device_list = []
    response = sbk_device_list_table.query(
        IndexName="USERID_INDEX",
        ScanIndexForward=True,
        KeyConditionExpression=Key('USERID').eq(user_id)
    )
    print(response)
    for device in response['Items']:
        if device['SENSOR_TYPE'] == sensor_type:
            device_list.append(device)

    return device_list    

def process_desk_overview(sensor, start_date_day, start_date_month, end_date):
    dev_eui = sensor['DEVEUI']
    device_name = dev_eui
    device_location = dev_eui
    if 'DEVICE_NAME' in sensor:
        device_name = sensor['DEVICE_NAME']
    if 'DEVICE_LOCATION' in sensor:
        device_location = sensor['DEVICE_LOCATION']        
    return_item = {}
    return_item = {
        'DEVEUI': dev_eui,
        'DEVICE_NAME': device_name,
        'DEVICE_LOCATION': device_location,
        'CURRENT_STATUS': 'VACANT',
        'OCCUPANCY_PERCENTAGES': {
            'OCCUPIED': 0,
            'VACANT': 100
        },
        'DAILY': {},
        'HOURLY': {},
    }
    
    if 'motion' in sensor:
        if sensor['motion'] == True:
            return_item['CURRENT_STATUS'] = 'OCCUPIED'
    for i in range(24):
        return_item['HOURLY'][i] = 0

    for i in range(31):
        return_item['DAILY'][i] = 0

    response_hourly = sbk_hourly_device_data_table.query(
        ScanIndexForward=True,
        KeyConditionExpression=Key('DEVEUI').eq(dev_eui) & Key('TSTAMP').between(start_date_day, end_date)
    )
    for item in response_hourly['Items']:
        record_time_stamp = item['TSTAMP']
        dt_object = datetime.fromtimestamp(record_time_stamp)
        hour_key = dt_object.hour
        return_item['HOURLY'][hour_key] = item['OCCUPIED_MINS']
        
    response_daily = sbk_daily_device_data_table.query(
        ScanIndexForward=True,
        KeyConditionExpression=Key('DEVEUI').eq(dev_eui) & Key('TSTAMP').between(start_date_month, end_date)
    )
    for item in response_daily['Items']:
        record_time_stamp = item['TSTAMP']
        dt_object = datetime.fromtimestamp(record_time_stamp)
        day_key = dt_object.day
        return_item['DAILY'][day_key] = round(item['OCCUPIED_MINS']/60, 2)

    response_daily_one_day = sbk_daily_device_data_table.query(
        ScanIndexForward=True,
        KeyConditionExpression=Key('DEVEUI').eq(dev_eui) & Key('TSTAMP').between(start_date_day, end_date)
    )
    for item in response_daily_one_day['Items']:
        return_item['OCCUPANCY_PERCENTAGES']['OCCUPIED'] = item['OCCUPIED_PERCENTAGE']
        return_item['OCCUPANCY_PERCENTAGES']['VACANT'] = item['VACANT_PERCENTAGE']
        
    return(return_item)

def process_room_overview(sensor, start_date_day, start_date_month, end_date):
    dev_eui = sensor['DEVEUI']
    device_name = dev_eui
    device_location = dev_eui
    if 'DEVICE_NAME' in sensor:
        device_name = sensor['DEVICE_NAME']
    if 'DEVICE_LOCATION' in sensor:
        device_location = sensor['DEVICE_LOCATION']        
    return_item = {}
    return_item = {
        'DEVEUI': dev_eui,
        'DEVICE_NAME': device_name,
        'DEVICE_LOCATION': device_location,
        'CURRENT_STATUS': 0,
        'OCCUPANCY_PERCENTAGES': {
            'OCCUPIED': 0,
            'VACANT': 100
        },
        'DAILY': {},
        'HOURLY': {},
    }
    
    if 'count_0' in sensor:
        return_item['CURRENT_STATUS'] = sensor['count_0']
    for i in range(24):
        return_item['HOURLY'][i] = 0
    for i in range(31):
        return_item['DAILY'][i] = 0

    response_hourly = sbk_hourly_device_data_table.query(
        ScanIndexForward=True,
        KeyConditionExpression=Key('DEVEUI').eq(dev_eui) & Key('TSTAMP').between(start_date_day, end_date)
    )
    for item in response_hourly['Items']:
        record_time_stamp = item['TSTAMP']
        dt_object = datetime.fromtimestamp(record_time_stamp)
        hour_key = dt_object.hour
        return_item['HOURLY'][hour_key] = item['count_0']
        
    response_daily = sbk_daily_device_data_table.query(
        ScanIndexForward=True,
        KeyConditionExpression=Key('DEVEUI').eq(dev_eui) & Key('TSTAMP').between(start_date_month, end_date)
    )
    for item in response_daily['Items']:
        record_time_stamp = item['TSTAMP']
        dt_object = datetime.fromtimestamp(record_time_stamp)
        day_key = dt_object.day
        return_item['DAILY'][day_key] = item['count_0']

    response_daily_one_day = sbk_daily_device_data_table.query(
        ScanIndexForward=True,
        KeyConditionExpression=Key('DEVEUI').eq(dev_eui) & Key('TSTAMP').between(start_date_day, end_date)
    ) 
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
    start_date_day = int(datetime.timestamp(right_now - timedelta(days=1)))
    start_date_month = int(datetime.timestamp(right_now - timedelta(days=30)))

    response_to_user = {
        'DESK_OVERVIEW': [],
        'ROOM_OVERVIEW': []
    }
    
    desk_sensor_list = get_device_list_by_sensor_type(user_id, 'DESK')
    room_sensor_list = get_device_list_by_sensor_type(user_id, 'GRIDEYE')

    for sensor in desk_sensor_list:
        response_to_user['DESK_OVERVIEW'].append(process_desk_overview(sensor, start_date_day, start_date_month, end_date))        

    for sensor in room_sensor_list:
        response_to_user['ROOM_OVERVIEW'].append(process_room_overview(sensor, start_date_day, start_date_month, end_date))

    return cors_web_response(200, response_to_user)
