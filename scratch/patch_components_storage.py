import re
import os

def patch_file(filepath):
    if not os.path.exists(filepath): return
    with open(filepath, "r") as f:
        content = f.read()

    # Determine relative path to utils/secureStorage
    depth = filepath.count('/') - 2 # Frontend/src/ is depth 0
    if "legacy_ui/" in filepath or "user/pages/" in filepath or "user/components/" in filepath:
        storage_import = "import secureStorage from '../../utils/secureStorage';"
    else:
        storage_import = "import secureStorage from '../utils/secureStorage';"

    # Add import after react
    if "import secureStorage" not in content:
        content = re.sub(r'(import .*?;)', r'\1\n' + storage_import, content, count=1)

    # Replace localStorage
    content = content.replace("localStorage.getItem", "secureStorage.getItem")
    content = content.replace("localStorage.setItem", "secureStorage.setItem")
    content = content.replace("localStorage.removeItem", "secureStorage.removeItem")
    content = content.replace("localStorage.clear", "secureStorage.clear")

    with open(filepath, "w") as f:
        f.write(content)

files = [
    "Frontend/src/legacy_ui/History.jsx",
    "Frontend/src/user/pages/Help.jsx",
    "Frontend/src/user/components/UserTour.jsx",
    "Frontend/src/user/components/OnboardingTour.jsx"
]

for file in files:
    patch_file(file)
