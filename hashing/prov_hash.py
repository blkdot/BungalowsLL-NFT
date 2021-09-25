import csv
import hashlib

hash_string = ''
with open('proof.csv') as file:
    reader = csv.reader(file)
    for row in reader:
        hash_string = hash_string + row[1]
print(hash_string)

prov_hash = hashlib.sha256(bytes.fromhex(hash_string)).hexdigest()

print('Prov Hash')
print(prov_hash)

with open('final_proof.csv', 'w', newline='') as csvFile:
    write = csv.writer(csvFile)
    write.writerow([hash_string, prov_hash])

