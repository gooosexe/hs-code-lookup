import csv
import json

input_file = 'hs_codes_cleaned.csv'
output_file = 'hs_codes.json'

entries = []

with open(input_file, newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        entries.append({
            "code": row["Code"].strip(),
            "description": row["Description of Goods"].strip(),
        })

with open(output_file, 'w', encoding='utf-8') as jsonfile:
    json.dump(entries, jsonfile, indent=2, ensure_ascii=False)
