import subprocess

for i in range(1, 100):
    chapter = f"{i:02d}"  # two-digit format
    url = f"https://www.cbsa-asfc.gc.ca/trade-commerce/tariff-tarif/2025/html/00/ch{chapter}-eng.html"
    subprocess.run(["wget", url])
