import re

with open("Frontend/src/services/api.ts", "r") as f:
    content = f.read()

# Add import
if "import secureStorage" not in content:
    content = content.replace("import logger from '../utils/logger';", "import logger from '../utils/logger';\nimport secureStorage from '../utils/secureStorage';")

# Replace localStorage with secureStorage
content = content.replace("localStorage.getItem", "secureStorage.getItem")
content = content.replace("localStorage.setItem", "secureStorage.setItem")
content = content.replace("localStorage.removeItem", "secureStorage.removeItem")
content = content.replace("localStorage.clear", "secureStorage.clear")

with open("Frontend/src/services/api.ts", "w") as f:
    f.write(content)
