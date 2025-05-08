import csv

def format_code_with_ss(code, ss):
	code = code.replace('.', '').zfill(8)
	formatted = f"{code[:2]}.{code[2:4]}.{code[4:6]}.{code[6:8]}"
	return f"{formatted}-{ss}" if ss else formatted

def clean_and_format_hs_csv(input_path, output_path):
	with open(input_path, newline='', encoding='utf-8') as infile, \
		 open(output_path, 'w', newline='', encoding='utf-8') as outfile:

		reader = csv.DictReader(infile)
		writer = csv.DictWriter(outfile, fieldnames=['Code', 'Description of Goods'])
		writer.writeheader()

		for row in reader:
			raw_code = row.get('Tariff Item', '').strip()
			ss = row.get('SS', '').strip()
			desc = row.get('Description of Goods', '').strip()
			if raw_code and desc:
				full_code = format_code_with_ss(raw_code, ss)
				writer.writerow({
					'Code': full_code,
					'Description of Goods': desc
				})

# Usage
clean_and_format_hs_csv('hs_codes.csv', 'cleaned_hs_merged.csv')
