import subprocess
import json
import sys

# Ensure stdout is configured for UTF-8 on Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

REPO = "ritesh-1918/HELPDESK.AI"

def run_gh(args):
    result = subprocess.run(["gh"] + args, capture_output=True, text=True, check=False)
    if result.returncode != 0:
        print(f"Error running {' '.join(args)}: {result.stderr}")
    else:
        print(f"Successfully ran gh {' '.join(args[:2])}")
    return result

# 1. Issue 128 - HTTP-Only Cookie Session Storage (level:critical / type:security)
title_128 = "[BOUNTY] [level:critical] Implement Secure HTTP-Only Cookie Session Storage for Supabase JWTs in Mobile and Web"
body_128 = """## 🎯 Problem Statement
Currently, Supabase JWT access and refresh tokens are stored in `AsyncStorage` (on mobile) and `LocalStorage` (on web). While functional, this configuration is vulnerable to Cross-Site Scripting (XSS) attacks. To build a secure, enterprise-grade architecture, we need to shift session storage into secure, `HttpOnly`, `Secure`, `SameSite=Strict` cookies managed securely via our backend gateway.

---

## 🛠️ Required Technical Implementation Steps:
1. **FastAPI Auth Cookie Middleware**: 
   - Create a middleware handler in the FastAPI backend that intercept auth responses (`/auth/login`, `/auth/signup`) and sets `access_token` and `refresh_token` as HTTP-Only, Secure, SameSite=Strict cookies.
2. **Web Session Sync**:
   - Update `authStore.js` on the website to read authentication status from server-side cookie verification rather than standard localStorage.
3. **Mobile Secure Storage Scoping**:
   - Update `LoginScreen.js` and `ProfileScreen.js` in the mobile app to securely pass auth headers or integrate cookie managers.
4. **Endpoint Protection**:
   - Refactor `get_current_user` in `backend/main.py` to read the JWT securely from the request cookies fallback rather than strictly from the `Authorization: Bearer` header.

---

## 🏷️ GSSoC Bounty Rules:
- **Difficulty Base**: `level:critical` (+80 pts)
- **Track**: `type:security` (+20 pts)
- **Standard Labels**: `gssoc`, `bounty`
- **Branch target**: All commits and PR branches MUST target the `gssoc` branch, NOT `main`.

---

### 🌟 Project Support & Developer Network (Show Some Love!)
If you want to support this project and connect with me, please take 30 seconds to:
1. ⭐ **Star this repository**: Helps our AI helpdesk get noticed! [Star here](https://github.com/ritesh-1918/HELPDESK.AI)
2. 🍴 **Fork this repository**: Keep a copy to build your own cool tools! [Fork here](https://github.com/ritesh-1918/HELPDESK.AI/fork)
3. 👤 **Follow @ritesh-1918 on GitHub**: Stay updated on real-time open-source projects! [Follow here](https://github.com/ritesh-1918)
4. 💼 **Connect on LinkedIn**: Let's build a strong engineering network! [Connect on LinkedIn](https://www.linkedin.com/in/ritesh1908/)

Happy coding! Let's build something secure together! 🚀🔥
"""

# 2. Issue 129 - Redis Caching Layer (level:critical / type:performance)
title_129 = "[BOUNTY] [level:critical] Establish Distributed Redis Caching Layer for AI Categorization and Sentence Transformer Embeddings"
body_129 = """## 🎯 Problem Statement
Currently, every ticket submitted triggers a full forward-pass through our `DistilBERT` categorization pipeline and `sentence-transformers` semantic duplicate checker. Under heavy concurrent load, this model inference causes latency spikes. We need to introduce a distributed **Redis caching layer** in the FastAPI backend to cache duplicate classification mappings and vector embedding computations.

---

## 🛠️ Required Technical Implementation Steps:
1. **Redis Cache Store Setup**:
   - Integrate Redis client (`redis-py` or `aioredis`) into the FastAPI backend. Provide a `.env` toggle `USE_REDIS_CACHE=True`.
2. **AI Inference Caching**:
   - Cache DistilBERT classification outputs using the md5 hash of the ticket text as the cache key. Set an appropriate TTL (e.g. 1 hour).
3. **Semantic Embedding Cache**:
   - Store generated vector embeddings in Redis cache for rapid duplicate lookup, avoiding re-computation if a similar ticket text matches.
4. **Self-Healing Fallbacks**:
   - Ensure the server starts gracefully without errors (`ALLOW_DEGRADED_STARTUP`) if Redis is offline.

---

## 🏷️ GSSoC Bounty Rules:
- **Difficulty Base**: `level:critical` (+80 pts)
- **Track**: `type:performance` (+15 pts)
- **Standard Labels**: `gssoc`, `bounty`
- **Branch target**: All commits and PR branches MUST target the `gssoc` branch, NOT `main`.

---

### 🌟 Project Support & Developer Network (Show Some Love!)
If you want to support this project and connect with me, please take 30 seconds to:
1. ⭐ **Star this repository**: Helps our AI helpdesk get noticed! [Star here](https://github.com/ritesh-1918/HELPDESK.AI)
2. 🍴 **Fork this repository**: [Fork here](https://github.com/ritesh-1918/HELPDESK.AI/fork)
3. 👤 **Follow @ritesh-1918 on GitHub**: [Follow here](https://github.com/ritesh-1918)
4. 💼 **Connect on LinkedIn**: [Connect on LinkedIn](https://www.linkedin.com/in/ritesh1908/)

Happy coding! Let's boost performance! 🚀🔥
"""

# 3. Issue 130 - Kubernetes & Optimized Docker Builds (level:advanced / type:devops)
title_130 = "[BOUNTY] [level:advanced] Containerize Backend Services with Multi-Stage Docker Builds and Automate Kubernetes Deployment Manifests"
body_130 = """## 🎯 Problem Statement
To package our FastAPI backend for enterprise cloud environments, we need a highly optimized, multi-stage production Docker image and standardized Kubernetes deployment manifests. This will enable automated horizontal scaling, ingress routing, and service isolation in cloud clusters.

---

## 🛠️ Required Technical Implementation Steps:
1. **Optimized Multi-Stage Dockerfile**:
   - Create a `backend/Dockerfile` using multi-stage builds. First stage compiles Python dependencies, second stage copies runtime binaries to reduce image footprint (target size < 300MB).
2. **Kubernetes Deployment & Service Specs**:
   - Write standard YAML manifests under `deploy/k8s/`:
     - `deployment.yaml`: FastAPI deployment specifying memory/CPU resource requests, limits, and readiness/liveness probes.
     - `service.yaml`: ClusterIP service exposing backend endpoints.
3. **Horizontal Pod Autoscaler (HPA)**:
   - Configure HPA targeting CPU utilization threshold of 75% with a replica scope of 2 to 10 pods.
4. **Ingress Resource**:
   - Write an Nginx Ingress manifest configuring host-based routing (e.g. `api.helpdesk.ai`).

---

## 🏷️ GSSoC Bounty Rules:
- **Difficulty Base**: `level:advanced` (+55 pts)
- **Track**: `type:devops` (+15 pts)
- **Standard Labels**: `gssoc`, `bounty`
- **Branch target**: All commits and PR branches MUST target the `gssoc` branch, NOT `main`.

---

### 🌟 Project Support & Developer Network (Show Some Love!)
If you want to support this project and connect with me, please take 30 seconds to:
1. ⭐ **Star this repository**: Helps our AI helpdesk get noticed! [Star here](https://github.com/ritesh-1918/HELPDESK.AI)
2. 🍴 **Fork this repository**: [Fork here](https://github.com/ritesh-1918/HELPDESK.AI/fork)
3. 👤 **Follow @ritesh-1918 on GitHub**: [Follow here](https://github.com/ritesh-1918)
4. 💼 **Connect on LinkedIn**: [Connect on LinkedIn](https://www.linkedin.com/in/ritesh1908/)

Happy coding! Let's scale the infrastructure! 🚀🔥
"""

# Raise the Issues on GitHub
issues = [
    (title_128, body_128, ["gssoc", "bounty", "level:critical", "type:security"]),
    (title_129, body_129, ["gssoc", "bounty", "level:critical", "type:performance"]),
    (title_130, body_130, ["gssoc", "bounty", "level:advanced", "type:devops"])
]

for title, body, labels in issues:
    labels_str = ",".join(labels)
    print(f"Creating issue: {title}...")
    run_gh(["issue", "create", "--repo", REPO, "--title", title, "--body", body, "--label", labels_str])

print("All GSSoC high-difficulty issues raised successfully!")
