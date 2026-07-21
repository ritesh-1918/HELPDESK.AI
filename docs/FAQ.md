# Frequently Asked Questions (FAQ)

This FAQ addresses common questions about setting up, developing with, and contributing to HELPDESK.AI.

## Table of Contents

- [Project Setup](#project-setup)
- [Installation & Dependencies](#installation--dependencies)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Development & Testing](#development--testing)
- [Build & Deployment](#build--deployment)
- [Common Issues & Troubleshooting](#common-issues--troubleshooting)
- [Contribution Workflow](#contribution-workflow)

---

## Project Setup

### Q: How do I clone and set up the HELPDESK.AI project locally?

**A:** Follow these steps to set up the project:

```bash
git clone https://github.com/ritesh-1918/HELPDESK.AI.git
cd HELPDESK.AI
```

For the frontend:
```bash
cd Frontend
npm install
npm run dev
```

For the backend, refer to the [backend README](../backend/README.md) for specific deployment instructions.

---

### Q: What are the system requirements for running HELPDESK.AI locally?

**A:** 
- **Node.js**: Version 20 or higher (for frontend)
- **Python**: 3.10+ (for backend AI services)
- **npm**: Latest stable version
- **Supabase Account**: Required for database and authentication
- **Git**: For version control

---

## Installation & Dependencies

### Q: I'm getting npm install errors. How do I resolve them?

**A:** Common npm installation issues and solutions:

1. **Clear npm cache**:
   ```bash
   npm cache clean --force
   ```

2. **Delete node_modules and package-lock.json**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check Node.js version**:
   ```bash
   node --version
   ```
   Ensure you're using Node.js 20 or higher.

4. **Network issues**: If you're behind a corporate firewall, configure npm to use your proxy:
   ```bash
   npm config set proxy http://proxy.company.com:8080
   npm config set https-proxy http://proxy.company.com:8080
   ```

---

### Q: How do I install backend Python dependencies?

**A:** Navigate to the backend directory and install requirements:

```bash
cd backend
pip install -r requirements.txt
```

If you encounter issues, consider using a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

## Environment Configuration

### Q: What environment variables do I need to configure?

**A:** Create a `.env` file in the `/Frontend` directory with the following variables:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_STRIPE_GROWTH_LINK=your_stripe_link
VITE_BACKEND_URL=http://localhost:8000
```

For backend services, you'll need additional environment variables for AI models and database connections. Refer to the backend documentation for specifics.

---

### Q: Where do I get my Supabase credentials?

**A:** 
1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Navigate to Project Settings → API
4. Copy the Project URL and anon/public API key
5. Add these to your `.env` file

---

### Q: My environment variables aren't being loaded. What should I check?

**A:** 
- Ensure your `.env` file is in the correct directory (`/Frontend` for frontend)
- Verify the file is named exactly `.env` (not `.env.txt` or similar)
- Restart your development server after adding environment variables
- Check that variable names match exactly (case-sensitive)
- For Vite projects, variables must start with `VITE_` to be accessible in the frontend

---

## Running the Application

### Q: How do I start the frontend development server?

**A:** 
```bash
cd Frontend
npm run dev
```

The server typically starts on `http://localhost:5173` or the port shown in the terminal output.

---

### Q: How do I start the backend AI services?

**A:** The backend can be deployed locally or on HuggingFace Spaces. For local development:

```bash
cd backend
python main.py
```

The FastAPI server typically runs on port 8000. For Docker deployment, refer to the [backend README](../backend/README.md).

---

### Q: The frontend can't connect to the backend. What's wrong?

**A:** Common connection issues:

1. **Backend not running**: Ensure the backend server is started
2. **Wrong URL**: Check `VITE_BACKEND_URL` in your `.env` file
3. **CORS issues**: The backend must allow requests from your frontend URL
4. **Port conflicts**: Ensure no other service is using port 8000
5. **Firewall**: Check if your firewall is blocking local connections

---

## Development & Testing

### Q: How do I run linting on the frontend?

**A:** 
```bash
cd Frontend
npm run lint
```

This runs ESLint with the project's configuration. Fix any reported errors before committing.

---

### Q: How do I format code with Prettier?

**A:** 
```bash
cd Frontend
npm run format
```

This automatically formats your code according to the project's Prettier configuration.

---

### Q: Are there automated tests I can run?

**A:** The project currently uses CI-based verification rather than traditional unit tests. The CI workflow checks:
- Frontend build verification
- Backend import verification

To simulate CI checks locally:
```bash
# Frontend build check
cd Frontend
npm run build

# Backend import check (from project root)
cd backend
python -c "
import os, sys
sys.path.append(os.getcwd())
from services.classifier_service import ClassifierService
try:
    service = ClassifierService()
    print('Import logic for AI Classifier is solid.')
except Exception as e:
    print(f'AI Logic Error: {e}')
"
```

For more details, see the [Testing Guide](./TESTING.md).

---

### Q: How do I debug frontend issues?

**A:** 
1. **Browser DevTools**: Use Chrome DevTools or Firefox Developer Tools for debugging
2. **React DevTools**: Install the React DevTools browser extension for component inspection
3. **Console logs**: Check the browser console for errors and warnings
4. **Network tab**: Monitor API calls and responses in the Network tab
5. **Breakpoints**: Set breakpoints in your browser's debugger or VS Code

---

## Build & Deployment

### Q: How do I build the frontend for production?

**A:** 
```bash
cd Frontend
npm run build
```

This creates an optimized production build in the `dist/` directory.

---

### Q: My build is failing. What are common causes?

**A:** Common build failures:

1. **Type errors**: Fix TypeScript/JavaScript type issues
2. **Missing dependencies**: Run `npm install` to ensure all dependencies are installed
3. **Environment variables**: Ensure all required `.env` variables are set
4. **Lint errors**: Run `npm run lint` and fix reported issues
5. **Memory issues**: Increase Node.js memory limit: `NODE_OPTIONS=--max-old-space-size=4096 npm run build`

---

### Q: How do I deploy the backend to HuggingFace Spaces?

**A:** Refer to the [backend README](../backend/README.md) for detailed HuggingFace Spaces deployment instructions. Key points:
- The space is configured to run as a Docker container on port 7860
- Ensure all environment variables are configured in the Space settings
- The health check endpoint is `/ready`

---

## Common Issues & Troubleshooting

### Q: I'm getting "Module not found" errors. How do I fix this?

**A:** 
1. Ensure you're in the correct directory (Frontend for frontend issues)
2. Run `npm install` to install all dependencies
3. Check that the import paths in your code are correct
4. Verify the file you're trying to import actually exists
5. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

### Q: The AI classifier isn't loading. What should I check?

**A:** 
1. Verify model files are present in `backend/models/classifier/`
2. Check that all Python dependencies are installed: `pip install -r requirements.txt`
3. Ensure you have sufficient memory for model loading (models can be large)
4. Check the backend logs for specific error messages
5. Verify the model path configuration in environment variables

---

### Q: Supabase authentication isn't working. How do I debug this?

**A:** 
1. Verify your Supabase URL and anon key are correct in `.env`
2. Check Supabase project status (ensure it's not paused)
3. Verify Row Level Security (RLS) policies in Supabase
4. Check browser console for specific authentication errors
5. Ensure your Supabase project allows your localhost for development

---

### Q: Docker container won't start. What should I check?

**A:** 
1. Verify Docker is running: `docker ps`
2. Check Docker logs: `docker logs <container_name>`
3. Ensure ports are not already in use
4. Verify Dockerfile syntax and dependencies
5. Check environment variables in Docker configuration
6. Ensure sufficient disk space for Docker images

---

### Q: I'm getting CORS errors when calling the API. How do I fix this?

**A:** CORS (Cross-Origin Resource Sharing) errors occur when the frontend and backend are on different domains/ports. Solutions:

1. **Development**: Configure the backend to allow requests from your frontend URL
2. **Proxy**: Use Vite's proxy configuration in `vite.config.js`
3. **Same Origin**: Deploy both frontend and backend to the same domain in production
4. **Backend Configuration**: Add CORS middleware in your FastAPI backend

---

## Contribution Workflow

### Q: How do I contribute to HELPDESK.AI?

**A:** 
1. Fork the repository on GitHub
2. Create a new branch from `upstream/main`: `git checkout -b feature/your-feature-name`
3. Make your changes following the project's code style
4. Test your changes thoroughly
5. Commit with clear, descriptive messages
6. Push to your fork: `git push origin feature/your-feature-name`
7. Create a Pull Request targeting the `gssoc` branch
8. Wait for review and address any feedback

---

### Q: What branch should I target for my Pull Request?

**A:** Pull Requests should target the `gssoc` branch, not `main`. This is specified in the project's contribution guidelines and CI configuration.

---

### Q: My PR isn't passing CI checks. What should I do?

**A:** 
1. Check the CI logs in the GitHub Actions tab
2. Reproduce the failure locally using the same commands
3. Fix the reported issues
4. Push your fixes to the same branch
5. The CI will automatically re-run on your new commit

Common CI failures:
- Frontend build errors: Fix build issues locally
- Backend import errors: Ensure all imports are correct
- Lint errors: Run `npm run lint` and fix reported issues

---

### Q: How do I write a good commit message?

**A:** Follow conventional commit format:
```
type(scope): description

Examples:
docs(readme): update installation instructions
fix(auth): resolve login timeout issue
feat(ui): add dark mode toggle
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

### Q: What should I include in my Pull Request description?

**A:** A good PR description includes:
- **Summary**: Brief description of changes
- **Motivation**: Why this change is needed
- **Changes**: List of files/areas modified
- **Testing**: How you tested the changes
- **Screenshots**: For UI changes
- **Related Issues**: Link to related GitHub issues

---

## Additional Resources

- [Project README](../README.md)
- [Backend README](../backend/README.md)
- [Testing Guide](./TESTING.md)
- [Architecture Documentation](./architecture.md)
- [GitHub Issues](https://github.com/ritesh-1918/HELPDESK.AI/issues)

---

## Still Need Help?

If you can't find an answer to your question:
1. Check existing [GitHub Issues](https://github.com/ritesh-1918/HELPDESK.AI/issues)
2. Search the codebase for similar implementations
3. Create a new issue with detailed information about your problem
4. Join the project's communication channels (if available)
