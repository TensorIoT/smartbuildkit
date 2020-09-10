import boto3
from botocore.exceptions import ClientError
import time
import json
import os
import decimal
from boto3.dynamodb.conditions import Key, Attr


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
            "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token",
            "Access-Control-Allow-Methods": "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT",
            "Access-Control-Allow-Origin": "*"
        },
        'body': json.dumps(body, cls=DecimalEncoder)
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

    user_id = get_user_id_from_event(event)
    if 'statusCode' in user_id:
        return user_id

    try:
        response = sbk_device_list_table.query(
            IndexName="USERID_INDEX",
            KeyConditionExpression=Key('USERID').eq(user_id),
        )
        print("The query returned the following items:")
        for item in response['Items']:
            if 'rssi' in item:
                item['BATTERY_PERCENTAGE'] = str(item['rssi'])
            else:
                item['BATTERY_PERCENTAGE'] = str(-100)
            print(item) 
    except ClientError as e:
        print(e.response['Error']['Message'])
        return cors_web_response(400, e.response['Error'])
    
    return cors_web_response(200, {'Items': response['Items']})