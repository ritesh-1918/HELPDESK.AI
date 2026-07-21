import re

with open("Frontend/src/services/api.js", "r") as f:
    content = f.read()

# Add imports
content = content.replace("import { API_CONFIG } from '../config';", "import { API_CONFIG } from '../config';\nimport useToastStore from '../store/toastStore';\nimport logger from '../utils/logger';")

# Add interceptor after delay function
interceptor = """
// --- Global Axios Interceptor ---
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    logger.error("API Error intercepted:", error);
    
    // Extract message
    let message = "An unexpected error occurred.";
    if (error.response?.data?.detail) {
      message = error.response.data.detail;
    } else if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }

    // Trigger toast
    const showToast = useToastStore.getState().showToast;
    if (showToast) {
      showToast(`Network Error: ${message}`, 'error', 5000);
    }
    
    return Promise.reject(new Error(message));
  }
);
"""
content = content.replace("const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));", "const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));\n" + interceptor)

# Replace console.error with logger.error in api.js
content = content.replace("console.error", "logger.error")
content = content.replace("console.warn", "logger.warn")

with open("Frontend/src/services/api.js", "w") as f:
    f.write(content)
