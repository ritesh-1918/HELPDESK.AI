import re

with open("backend/main.py", "r") as f:
    content = f.read()

# Extract from @app.post("/ai/analyze_ticket") down to just before auth
match = re.search(r'(@app\.post\("/ai/analyze_ticket", response_model=TicketResponse\).*?)(?=class LoginBody)', content, re.DOTALL)
if match:
    ai_routes = match.group(1)
    ai_routes = ai_routes.replace("@app.", "@router.")
    
    with open("backend/routers/ai.py", "a") as f:
        f.write("\n" + ai_routes)
