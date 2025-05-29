#!/bin/bash

echo "🚀 Setting up CloudSnap with real photo upload..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing frontend dependencies..."
npm install

echo "📦 Setting up backend server..."
# Create server directory if it doesn't exist
mkdir -p server
cd server

# Create package.json for server
cat > package.json << 'EOF'
{
  "name": "cloudsnap-server",
  "version": "1.0.0",
  "description": "CloudSnap photo upload server",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "multer": "^1.4.5-lts.1",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
EOF

# Install server dependencies
echo "📦 Installing server dependencies..."
npm install

# Create server.js
cat > server.js << 'EOF'
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 8081;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Keep original filename with timestamp to avoid conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit per file
  }
});

// Serve uploaded images statically
app.use('/uploads', express.static(uploadsDir));

// Upload endpoint
app.post('/api/upload', upload.array('photos', 50), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      path: `/uploads/${file.filename}`
    }));

    // Calculate total size in MB
    const totalSize = req.files.reduce((sum, file) => sum + file.size, 0);
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(1);

    res.json({
      success: true,
      message: `Successfully uploaded ${req.files.length} photos`,
      files: uploadedFiles,
      totalFiles: req.files.length,
      totalSizeMB: parseFloat(totalSizeMB)
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get uploaded photos
app.get('/api/photos', (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext);
    });

    const photos = imageFiles.map(file => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      return {
        filename: file,
        path: `/uploads/${file}`,
        size: stats.size,
        uploadDate: stats.birthtime
      };
    });

    res.json({ photos });
  } catch (error) {
    console.error('Error reading photos:', error);
    res.status(500).json({ error: 'Failed to read photos' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Access from your phone: http://192.168.0.17:${PORT}`);
});
EOF

cd ..

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the application:"
echo "1. Start the backend server:"
echo "   cd server && npm start"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   npm run dev"
echo ""
echo "📱 Access the app from your phone at: http://192.168.0.17:8080"
echo "🖥️  Server API runs at: http://192.168.0.17:8081"
echo ""
echo "📸 The app will now:"
echo "   • Ask for real photo access permissions"
echo "   • Allow you to select actual photos from your device"
echo "   • Upload them to the server/uploads folder"
echo "   • Show real photos in the gallery and search results"
