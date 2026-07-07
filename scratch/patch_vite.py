import re

with open("Frontend/vite.config.js", "r") as f:
    content = f.read()

# Add test config to export default defineConfig({
if "test: {" not in content:
    content = content.replace("plugins: [react()],", "plugins: [react()],\n  test: {\n    globals: true,\n    environment: 'jsdom',\n    setupFiles: [],\n  },")

with open("Frontend/vite.config.js", "w") as f:
    f.write(content)
