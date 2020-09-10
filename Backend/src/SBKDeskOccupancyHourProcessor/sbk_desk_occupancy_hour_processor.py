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

iot_client = boto3.client('iot')

users = ['RAVI', 'KARTHIK']

def process_desks(desk_device_list):
    print("Going to process desks")
    right_now = datetime.now()
    this_hour = int(datetime.timestamp(datetime(right_now.year, right_now.month, right_now.day, right_now.hour)))
    today = int(datetime.timestamp(datetime(right_now.year, right_now.month, right_now.day)))
    for desk_device in desk_device_list:
        end_date = int(datetime.timestamp(right_now))
        start_date = int(datetime.timestamp(right_now - timedelta(hours=1)))
        try:
            response = sbk_device_data_table.query(
                ScanIndexForward=True,
                KeyConditionExpression=Key('DEVEUI').eq(desk_device['DEVEUI']) & Key('TSTAMP').between(start_date, end_date)
            )
            print("The query returned the following items:")
            print(response)
            new_db_item = []
            new_db_item = desk_device
            new_db_item['TSTAMP'] = this_hour            
            if response['Count'] == 0:
                if new_db_item['motion'] == False:
                    new_db_item['OCCUPIED_MINS'] = 0
                    new_db_item['OCCUPIED_PERCENTAGE'] = 0
                    new_db_item['VACANT_MINS'] = 60
                    new_db_item['VACANT_PERCENTAGE'] = 100
                else:
                    new_db_item['OCCUPIED_MINS'] = 60
                    new_db_item['OCCUPIED_PERCENTAGE'] = 100
                    new_db_item['VACANT_MINS'] = 0
                    new_db_item['VACANT_PERCENTAGE'] = 0
            else:
                new_db_item['OCCUPIED_MINS'] = 0
                last_time = start_date
                for desk_item in response['Items']:
                    if desk_item['motion'] == True:
                        new_db_item['OCCUPIED_MINS'] = new_db_item['OCCUPIED_MINS'] + int((desk_item['TSTAMP'] - last_time)/60)
                    last_time = desk_item['TSTAMP']
                new_db_item['VACANT_MINS'] = 60 - new_db_item['OCCUPIED_MINS']
                new_db_item['OCCUPIED_PERCENTAGE'] = int(new_db_item['OCCUPIED_MINS']*100/60)
                new_db_item['VACANT_PERCENTAGE'] = int(new_db_item['VACANT_MINS']*100/60)
                
            response_new = sbk_hourly_device_data_table.put_item(Item=new_db_item)
            
            response_daily = sbk_daily_device_data_table.query(
                ScanIndexForward=True,
                KeyConditionExpression=Key('DEVEUI').eq(desk_device['DEVEUI']) & Key('TSTAMP').eq(today)
            )
            if response_daily['Count'] == 0:
                new_daily_db_item = []
                new_daily_db_item = desk_device
                new_daily_db_item['TSTAMP'] = today
                if new_db_item['motion'] == False:
                    new_daily_db_item['OCCUPIED_MINS'] = 0
                    new_daily_db_item['OCCUPIED_PERCENTAGE'] = 0
                    new_daily_db_item['VACANT_MINS'] = 1440
                    new_daily_db_item['VACANT_PERCENTAGE'] = 100
                else:
                    new_daily_db_item['OCCUPIED_MINS'] = 60
                    new_daily_db_item['OCCUPIED_PERCENTAGE'] = int(60*100/1440)
                    new_daily_db_item['VACANT_MINS'] = 1380
                    new_daily_db_item['VACANT_PERCENTAGE'] = int(1380*100/1440)
                response_daily_insert = sbk_daily_device_data_table.put_item(Item=new_daily_db_item)
            else:
                new_daily_db_item = response_daily['Items'][0]
                new_daily_db_item['OCCUPIED_MINS'] = new_daily_db_item['OCCUPIED_MINS'] + new_db_item['OCCUPIED_MINS']
                new_daily_db_item['VACANT_MINS'] = new_daily_db_item['VACANT_MINS'] - new_db_item['OCCUPIED_MINS']
                new_daily_db_item['OCCUPIED_PERCENTAGE'] = int(new_daily_db_item['OCCUPIED_MINS']*100/1440)
                new_daily_db_item['VACANT_PERCENTAGE'] = int(new_daily_db_item['VACANT_MINS']*100/1440)
                response_daily_insert = sbk_daily_device_data_table.put_item(Item=new_daily_db_item)
        except ClientError as e:
            print(e.response['Error']['Message'])
            return ''
    return ''

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
    desk_device_list = []
    try:
        response = sbk_device_list_table.query(
            IndexName="SENSOR_TYPE_INDEX",
            ScanIndexForward=True,
            KeyConditionExpression=Key('SENSOR_TYPE').eq('DESK')
        )
        print("The query returned the following items:")
        for item in response['Items']:
            newItem = {}
            newItem['DEVEUI'] = item['DEVEUI']
            newItem['TSTAMP'] = item['LAST_MESSAGE']
            newItem['motion'] = False
            newItem['USERID'] = item['USERID']
            newItem['SENSOR_TYPE'] = 'DESK'
            if 'motion' in item:
                newItem['motion'] = item['motion']
            desk_device_list.append(newItem)
    except ClientError as e:
        print(e.response['Error']['Message'])
        return ''
    process_desks(desk_device_list)
    
    return ''