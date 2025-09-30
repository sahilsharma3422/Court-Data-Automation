#!/bin/bash

# Court Data Fetcher - Automated Setup Script
# This script sets up both frontend and backend

echo "=========================================="
echo "Court Data Fetcher - Setup Script"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Create project root directory
PROJECT_DIR="court-data-fetcher"
echo "📁 Creating project directory: $PROJECT_DIR"

if [ -d "$PROJECT_DIR" ]; then
    echo "⚠️  Directory already exists. Do you want to remove it? (y/n)"
    read -r response
    if [ "$response" = "y" ]; then
        rm -rf "$PROJECT_DIR"
        echo "🗑️  Removed existing directory"
    else
        echo "❌ Setup cancelled"
        exit 1
    fi
fi

mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR" || exit

echo ""
echo "=========================================="
echo "Setting up Backend"
echo "=========================================="
echo ""

# Create backend directory
mkdir -p backend
cd backend || exit

# Initialize npm
echo "📦 Initializing npm..."
npm init -y

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install express cors axios cheerio sqlite3 dotenv

# Install dev dependencies
npm install --save-dev nodemon

# Create server.js
echo "📝 Creating server.js..."
cat > server.js << 'EOF'
// Paste the backend server.js code here
// (Copy from the backend artifact)
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
EOF

# Create .env file
echo "📝 Creating .env file..."
cat > .env << 'EOF'
PORT=3001
NODE_ENV=development
EOF

# Create .gitignore
echo "📝 Creating .gitignore..."
cat > .gitignore << 'EOF'
node_modules/
.env
*.db
*.log
EOF

# Update package.json scripts
echo "📝 Updating package.json scripts..."
npm pkg set scripts.start="node server.js"
npm pkg set scripts.dev="nodemon server.js"

echo "✅ Backend setup complete!"
echo ""

# Go back to project root
cd ..

echo "=========================================="
echo "Setting up Frontend"
echo "=========================================="
echo ""

# Create React app
echo "📦 Creating React application..."
npx create-react-app frontend

cd frontend || exit

# Install additional dependencies
echo "📦 Installing frontend dependencies..."
npm install lucide-react axios

# Install Tailwind CSS
echo "📦 Installing Tailwind CSS..."
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Create tailwind.config.js
echo "📝 Configuring Tailwind CSS..."
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# Update index.css
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

echo "✅ Frontend setup complete!"
echo ""

# Go back to project root
cd ..

echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "📁 Project structure created:"
echo "   $PROJECT_DIR/"
echo "   ├── backend/"
echo "   │   ├── server.js"
echo "   │   ├── package.json"
echo "   │   └── .env"
echo "   └── frontend/"
echo "       ├── src/"
echo "       ├── public/"
echo "       └── package.json"
echo ""
echo "🚀 Next steps:"
echo ""
echo "1. Add the backend code to backend/server.js"
echo "2. Add the React component code to frontend/src/App.js"
echo ""
echo "3. Start the backend:"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "4. Start the frontend (in a new terminal):"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "5. Open http://localhost:3000 in your browser"
echo ""
echo "✅ Setup complete! Happy coding! 🎉"