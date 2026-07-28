import json

with open("Frontend/package.json", "r") as f:
    data = json.load(f)

data["scripts"]["test"] = "vitest run"
data["scripts"]["test:ui"] = "vitest --ui"

with open("Frontend/package.json", "w") as f:
    json.dump(data, f, indent=2)
