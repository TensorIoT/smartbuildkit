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
    if 'DevEUI' not in event:
        print('No DevEUI Present')
        return ''
    if event['DevEUI'] == '02-00-00-01-00-00-FF-05' or event['DevEUI'] == '02-00-00-01-00-00-FF-04':
        print('Demo Devices.  so skipping')
        return ''
    original_event = {}
    original_event = event
    right_now = datetime.now()
    this_hour = int(datetime.timestamp(datetime(right_now.year, right_now.month, right_now.day, right_now.hour)))
    today = int(datetime.timestamp(datetime(right_now.year, right_now.month, right_now.day)))

    event['DEVEUI'] = event['DevEUI']
    event['TSTAMP'] = int(datetime.timestamp(right_now))
    event['LAST_MESSAGE'] = event['TSTAMP']
    dev_eui = event['DEVEUI']
    event['USERID'] = dev_eui
    thing_parser_name = None
    try:
        iot_thing_response = iot_client.describe_thing(
            thingName=dev_eui
        )
        print(iot_thing_response)
        if 'attributes' not in iot_thing_response:
            print(' Doesnt have thing type attributes ')
            return ''
        if 'parser' not in iot_thing_response['attributes']:
            print(' Doesnt have thing type attribute parser ')
            return ''            
        thing_parser_name = iot_thing_response['attributes']['parser']
    except Exception as e:
        print(" Get Thing Error ")
        print(e)
        return ''
    if thing_parser_name != 'tracknet_tabs_smarthome_v10':
        #print(" Not of the type smarthome ")
        return ''
    print(event)
    try:
        response = sbk_device_list_table.get_item(Key={'DEVEUI': dev_eui})
        print(response)
    except ClientError as e:
        print(e.response['Error']['Message'])
        
    if 'Item' in response:
        event['USERID'] = response['Item']['USERID']
        try:
            item = response['Item']
            item['LAST_MESSAGE'] = event['TSTAMP']
            if 'SENSOR_TYPE' not in item:
                event['SENSOR_TYPE'] = 'UNKNOWN'
                item['SENSOR_TYPE'] = 'UNKNOWN'
            else:
                event['SENSOR_TYPE'] = item['SENSOR_TYPE']
            if 'battery' in event:
                item['BATTERY_PERCENTAGE'] = str(event['battery'])
            for event_item in event:
                item[event_item] = event[event_item]
            response = sbk_device_list_table.put_item(Item=item)
        except ClientError as e:
            print(e.response['Error']['Message'])
    else:
        print("RECORD NOT IN MASTER TABLE")
        return ''       

    if 'msgtype' not in event:
        print("MESSAGE TYPE NOT FOUND")
        return ''
    
    response = sbk_device_data_table.put_item(Item=event)

    if event['SENSOR_TYPE'] == 'GRIDEYE':
        print("*********GRIDEYE***************") 
        if 'count_0' in event:
            # Processing Hour
            hourly_item = {}
            hourly_item['DEVEUI'] = event['DEVEUI']
            hourly_item['TSTAMP'] = event['LAST_MESSAGE']
            hourly_item['count_0'] = event['count_0']
            hourly_item['USERID'] = event['USERID']
            hourly_item['SENSOR_TYPE'] = 'GRIDEYE'
            hourly_item['TSTAMP'] = this_hour
            need_to_insert = True
            response_hourly = sbk_hourly_device_data_table.query(
                ScanIndexForward=True,
                KeyConditionExpression=Key('DEVEUI').eq(dev_eui) & Key('TSTAMP').eq(this_hour)
            )
            for item in response_hourly['Items']:
                if item['count_0'] > hourly_item['count_0']:
                    need_to_insert = False
            if need_to_insert:
                response_new = sbk_hourly_device_data_table.put_item(Item=hourly_item)

            # Processing Day
            daily_item = {}
            daily_item['DEVEUI'] = event['DEVEUI']
            daily_item['TSTAMP'] = event['LAST_MESSAGE']
            daily_item['count_0'] = event['count_0']
            daily_item['USERID'] = event['USERID']
            daily_item['SENSOR_TYPE'] = 'GRIDEYE'
            daily_item['TSTAMP'] = today
            need_to_insert = True
            response_daily = sbk_daily_device_data_table.query(
                ScanIndexForward=True,
                KeyConditionExpression=Key('DEVEUI').eq(dev_eui) & Key('TSTAMP').eq(today)
            )
            for item in response_daily['Items']:
                if item['count_0'] > daily_item['count_0']:
                    need_to_insert = False
            if need_to_insert:
                response_new = sbk_daily_device_data_table.put_item(Item=daily_item)
    else:
        print("********* NOT GRIDEYE***************")          


    print(response)
    return ''