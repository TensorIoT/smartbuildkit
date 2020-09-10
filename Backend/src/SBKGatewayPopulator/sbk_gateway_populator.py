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

def lambda_handler(event, context):
    # TODO implement
    print(event)
    original_event = {}
    original_event = event
    right_now = datetime.now()
    this_hour = int(datetime.timestamp(datetime(right_now.year, right_now.month, right_now.day, right_now.hour)))
    today = int(datetime.timestamp(datetime(right_now.year, right_now.month, right_now.day)))

    dev_eui = event['routerid']

    try:
        response = sbk_device_list_table.get_item(Key={'DEVEUI': dev_eui})
        print(response)
    except ClientError as e:
        print(e.response['Error']['Message'])
           
    if 'Item' in response:
        event['USERID'] = response['Item']['USERID']
        try:
            item = response['Item']
            item['LAST_MESSAGE'] = int(datetime.timestamp(right_now))
            item['TSTAMP'] = int(datetime.timestamp(right_now))
            item['SENSOR_TYPE'] = 'GATEWAY'
            item['BATTERY_PERCENTAGE'] = '100'
            item['rssi'] = -20
            if 'last_dntime' in event:
                item['last_dntime'] = int(event['last_dntime'])
            if 'last_uptime' in event:
                item['last_uptime'] = int(event['last_uptime'])
            if 'last_connect' in event:
                item['last_connect'] = int(event['last_connect'])
            if 'last_disconnect' in event:
                item['last_disconnect'] = int(event['last_disconnect'])                                                
            response = sbk_device_list_table.put_item(Item=item)
        except ClientError as e:
            print(e.response['Error']['Message'])
    else:
        print("RECORD NOT IN MASTER TABLE")
        return ''               

    print(response)
    return ''