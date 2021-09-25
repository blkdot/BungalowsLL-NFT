import ipfshttpclient
import hashlib
import json
import csv

MAX_NFT = 77
ipfs = ipfshttpclient.connect()

with open('proof.csv', 'w', newline='') as csvfile:
    writer = csv.writer(csvfile)
    for x in range(0, MAX_NFT):
        with open('./all/'+str(x)+'.jpg', 'rb') as file:
            bytes = file.read()
            readable_hash = hashlib.sha256(bytes).hexdigest()
            cid = ipfs.add('./all/'+str(x)+'.jpg', offline=True, cid_version=0)
            writer.writerow([x, readable_hash, cid['Hash']])


