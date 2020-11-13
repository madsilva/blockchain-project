# This is a sample Python script.

# Press ⇧F10 to execute it or replace it with your code.
# Press Double ⇧ to search everywhere for classes, files, tool windows, actions, and settings.

import json
import random
import string
import datetime
import time

def sale(affiliate_code,delay):
    state=random.choice(["AWAITING_FULFILLMENT","AWAITING_PAYMENT","COMPLETE"])
    complete = state=="COMPLETE"
    time.sleep(random.randint(0, delay*1000))
    return {"affiliate_code":affiliate_code,
      "buyerHandle": "",
      "buyerId": ''.join(random.choices(string.ascii_uppercase + string.ascii_lowercase + string.digits, k=46)),
      "coinType": "USD",
      "moderated": random.choice([True,False]),
      "orderId": ''.join(random.choices(string.ascii_uppercase + string.ascii_lowercase + string.digits, k=46)),
      "paymentCoin": "ETH",
      "read": True if complete else random.choice([True,False]),
      "shippingAddress": "1060 W Addison",
      "shippingName": "Elwood Blues",
      "slug": "eth-physical-order-testing-w-options",
      "state": state,
      "thumbnail": ''.join(random.choices(string.ascii_uppercase + string.ascii_lowercase + string.digits, k=46)),
      "timestamp": datetime.datetime.utcnow().replace(microsecond=0).isoformat(),
      "title": "ETH physical order testing w/ options",
      "total": str(random.randint(10000,99999999)),
      "unreadChatMessages": 0}

def newRecord(sellerKey, affiliate_code, norders, pcaff):
    #''.join(random.choices(string.ascii_uppercase + string.digits, k=N))
    nr= {"queryCount": norders,"sales":[sale(affiliate_code if random.random()<pcaff else "",0) for i in range(norders)]}
    with open(f'{sellerKey}.json', 'w') as fp:
        json.dump(nr, fp)

def appendsales(sellerKey,affiliate_code,norders,pcaff):
    with open(f'{sellerKey}.json', 'w+') as fp:
        record=json.load(fp)
        print(record)
        #record['sales'].append([sale(affiliate_code if random.random()<pcaff else "",0) for i in range(norders)])


# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    print_hi('PyCharm')

# See PyCharm help at https://www.jetbrains.com/help/pycharm/
