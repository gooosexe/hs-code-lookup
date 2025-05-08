import csv
import os
from bs4 import BeautifulSoup

master_rows = []

for i in range(1, 100):
	chapter = f"{i:02d}"
	html_file = f"ch{chapter}-eng.html"

	if not os.path.exists(html_file):
		print(f"✘ Skipping chapter {chapter}: file not found")
		continue

	with open(html_file, "r", encoding="utf-8") as f:
		soup = BeautifulSoup(f, "html.parser")

	table = soup.find("table", class_="wb-tables")
	if not table:
		print(f"✘ No table found in {html_file}")
		continue

	for tbody in table.find_all("tbody"):
		for tr in tbody.find_all("tr"):
			cols = [td.get_text(" ", strip=True) for td in tr.find_all("td")]
			if len(cols) >= 6 and "Tariff Item" not in cols[0]:
				# Prepend chapter number for tracking
				master_rows.append([chapter] + cols[:6])

	print(f"✔ Parsed chapter {chapter} ({len(master_rows)} total rows so far)")

# Write all collected rows to one master CSV
with open("full_tariff_master.csv", "w", newline="", encoding="utf-8") as f:
	writer = csv.writer(f)
	writer.writerow([
		"Chapter", "Tariff Item", "SS", "Description of Goods",
		"Unit of Meas.", "MFN Tariff", "Applicable Preferential Tariffs"
	])
	writer.writerows(master_rows)

print(f"✅ Done. {len(master_rows)} rows written to 'full_tariff_master.csv'")
