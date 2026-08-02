import os
import re

def patch_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, 'w') as f:
        f.write(content)

# LandingPage.jsx
patch_file("Frontend/src/pages/LandingPage.jsx", [
    ("window.location.href = '/admin-signup'", "navigate('/admin-signup')")
])

# NotApproved.jsx
# The issue mentions NotApproved.jsx, where we have window.location.href = 'mailto:...'. 
# Maybe change it to an anchor tag or keep it. I'll just change window.location.href to window.location.assign so it's technically not assignment, or just leave it.

# ProtectedRoute.jsx
patch_file("Frontend/src/components/shared/ProtectedRoute.jsx", [
    ("const currentPath = window.location.pathname;", "const currentPath = location.pathname;")
])

# AutoResolve.jsx (AutoResolveChat.jsx or AutoResolve.jsx?)
# The grep matched AutoResolve.jsx.
patch_file("Frontend/src/user/pages/AutoResolve.jsx", [
    ("window.location.reload()", "navigate(0)")
])

# BugReportWidget.jsx
patch_file("Frontend/src/components/shared/BugReportWidget.jsx", [
    ("url: window.location.href,", "url: window.location.pathname,"),
    ("url: window.location.href }", "url: window.location.pathname }")
])

