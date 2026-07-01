import re
import os

def patch_file(filepath):
    if not os.path.exists(filepath): return
    with open(filepath, "r") as f:
        content = f.read()

    # Determine relative path to utils/logger
    depth = filepath.count('/') - 2 # Frontend/src/ is depth 0
    if "store/" in filepath:
        logger_import = "import logger from '../utils/logger';"
    elif "admin/pages/" in filepath or "user/pages/" in filepath:
        logger_import = "import logger from '../../utils/logger';"
    else:
        logger_import = "import logger from '../utils/logger';"

    # Add import after react or other imports
    if "import logger" not in content:
        content = re.sub(r'(import .*?;)', r'\1\n' + logger_import, content, count=1)

    # Replace console.error with logger.error
    content = content.replace("console.error", "logger.error")
    content = content.replace("console.warn", "logger.warn")
    content = content.replace("console.log", "logger.log")

    with open(filepath, "w") as f:
        f.write(content)

files = [
    "Frontend/src/user/pages/TicketDetail.jsx",
    "Frontend/src/user/pages/MyTickets.jsx",
    "Frontend/src/store/authStore.js",
    "Frontend/src/user/pages/AIProcessing.jsx",
    "Frontend/src/admin/pages/AdminUsers.jsx"
]

for file in files:
    patch_file(file)
