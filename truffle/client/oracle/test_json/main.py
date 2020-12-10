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
      "timestamp": datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat(),
      "title": "ETH physical order testing w/ options",
      "total": str(random.randint(10000,99999999)),
      "unreadChatMessages": 0}

def newRecord(sellerKey, affiliate_code, norders, pcaff):
    #''.join(random.choices(string.ascii_uppercase + string.digits, k=N))
    nr= {"queryCount": norders,"sales":[sale(affiliate_code if random.random()<pcaff else "",0) for i in range(norders)]}
    with open(f'{sellerKey}.json', 'w') as fp:
        json.dump(nr, fp)
    fp.close()

def appendsales(sellerKey,affiliate_code,norders,pcaff):
    with open(f'{sellerKey}.json', 'r+') as fp:
        record=json.load(fp)
        #print(record)
        fp.seek(0)
        record['sales'].append([sale(affiliate_code if random.random()<pcaff else "",0) for i in range(norders)])
        record["queryCount"]+=norders
        fp.truncate()
        json.dump(record,fp)
    fp.close()
    return

def demo(sellerKey,affFilename="affcodes.txt",cycle=900):
    tics=0
    affFile = open(affFilename, "r")
    affCodes = [(line.strip()).split() for line in affFile]
    print(affCodes)
    affFile.close()
    record=newRecord(sellerKey,"",100,0)
    newSales=[]
    while(True):
        time.sleep(1)
        tics+=1
        sample=random.sample(affCodes, random.randint(1, 1 + len(affCodes)//3))
        for code in sample:
            norders = random.randint(0,10)
            pcaff = (sqrt(tics%cycle)/sqrt(cycle))-random.random()*(sqrt(tics%cycle)/sqrt(cycle))/2
            newSales+=[sale(code[0] if random.random()<pcaff else "",0) for i in range(norders)]
            print(f"added {norders} new sales")
            #print(code)
            #print(pcaff)
        if tics%10==0:
            with open(f'{sellerKey}.json', 'r+') as fp:
                record = json.load(fp)
                # print(record)
                fp.seek(0)
                record['sales'].append(newSales)
                record["queryCount"] += len(newSales)
                fp.truncate()
                json.dump(record, fp)
            fp.close()
            print(f"wrote {len(newSales)} records")
            newSales=[]
            affFile = open(affFilename, "r")
            affCodes = [(line.strip()).split() for line in affFile]
            affFile.close()