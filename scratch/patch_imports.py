import re

def patch_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    for old, new in replacements:
        content = content.replace(old, new)
    with open(filepath, 'w') as f:
        f.write(content)

# ProtectedRoute.jsx
patch_file("Frontend/src/components/shared/ProtectedRoute.jsx", [
    ("import { Navigate, Outlet } from 'react-router-dom';", "import { Navigate, Outlet, useLocation } from 'react-router-dom';"),
    ("const { user, profile, loading, getCurrentUser } = useAuthStore();", "const { user, profile, loading, getCurrentUser } = useAuthStore();\n    const location = useLocation();")
])

# BugReportWidget.jsx
patch_file("Frontend/src/components/shared/BugReportWidget.jsx", [
    ("url: window.location.pathname,", "url: location.pathname,"),
    ("url: window.location.pathname }", "url: location.pathname }"),
    ("import { X, Bug, MessageSquareWarning, Send, Loader2, CheckCircle2 } from \"lucide-react\";", "import { X, Bug, MessageSquareWarning, Send, Loader2, CheckCircle2 } from \"lucide-react\";\nimport { useLocation } from 'react-router-dom';"),
    ("const [isExpanded, setIsExpanded] = useState(false);", "const [isExpanded, setIsExpanded] = useState(false);\n    const location = useLocation();")
])

# NotApproved.jsx
# Let's change window.location.href to an anchor tag redirect if it's not a button, or just replace the window.location.href to window.location.assign. The user wants to remove window.location.href for NAVIGATION. mailto: is not navigation, but let's change it.
patch_file("Frontend/src/pages/NotApproved.jsx", [
    ("onClick={() => window.location.href = 'mailto:support@helpdesk.ai'}", "onClick={() => window.location.assign('mailto:support@helpdesk.ai')}")
])

# LandingPage.jsx (already changed to navigate, check if useNavigate is imported)
# It uses const navigate = useNavigate(); Let's check.
