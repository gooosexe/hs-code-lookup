import csv
import json

input_file = 'hs_codes_cleaned.csv'
output_file = 'hs_codes_NO_SS.json'

entries = []

def is_full_code(code):
    # full codes have format like 01.01.21.00 → 4 segments
    return len(code.split('.')) == 4 and all(part.isdigit() for part in code.split('.'))

with open(input_file, newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        code = row["Code"].strip()
        desc = row["Description of Goods"].strip()
        if is_full_code(code):
            entries.append({
                "code": code,
                "description": desc,
            })

with open(output_file, 'w', encoding='utf-8') as jsonfile:
    json.dump(entries, jsonfile, indent=2, ensure_ascii=False)
