# Package Audit & Upgrade Script
# Fixes #2972 - Refactor outdated packages to stable versions

import subprocess,sys,json

# Packages with known stable update targets
UPGRADE_MAP = {
    "express": "^4.19.2",
    "axios": "^1.7.2",
    "lodash": "^4.17.21",
    "moment": "^2.30.1",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.5.1",
    "dotenv": "^16.4.5",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "socket.io": "^4.7.5",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.14",
    "uuid": "^10.0.0",
    "validator": "^13.12.0",
}

SECURITY_PATCHES = [
    "follow-redirects>=1.15.6",
    "tough-cookie>=4.1.4",
    "semver>=7.5.4",
    "word-wrap>=1.2.4",
]

def audit_packages():
    result = subprocess.run(["npm","audit","--json"],capture_output=True,text=True)
    try:
        data = json.loads(result.stdout)
        vulns = data.get("metadata",{}).get("vulnerabilities",{})
        print(f"Vulnerabilities: critical={vulns.get("critical",0)} high={vulns.get("high",0)}")
        return data
    except:
        return {}

def apply_upgrades():
    pkgs = [f"{k}@{v}" for k,v in UPGRADE_MAP.items()]
    subprocess.run(["npm","install","--save"]+pkgs)
    print(f"Upgraded {len(pkgs)} packages")

if __name__ == "__main__":
    audit_packages()
    apply_upgrades()
    print("Security patches:",SECURITY_PATCHES)
