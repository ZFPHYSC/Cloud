const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const PORT = 8081;

// Initialize OpenAI
// IMPORTANT: Replace with your actual OpenAI API key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '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';

if (OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
  console.warn('⚠️  WARNING: Please set your OpenAI API key!');
  console.warn('⚠️  Either set OPENAI_API_KEY environment variable or replace the placeholder in server.js');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// In-memory storage for photo data and embeddings
const photoDatabase = new Map();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
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

// Helper function to encode image to base64
function encodeImageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString('base64');
}

// Helper function to analyze image with GPT-4 Vision
async function analyzeImageWithVision(imagePath) {
  try {
    const base64Image = encodeImageToBase64(imagePath);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using gpt-4o-mini for cost efficiency
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Describe this image in detail. Include: people (relationships if apparent), location, activities, colors, clothing, objects, and any text visible. Be specific about distinguishing features that would help someone search for this photo later."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: "high" // Use high detail for better analysis
              }
            }
          ]
        }
      ],
      max_tokens: 300
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Vision API error:', error);
    return null;
  }
}

// Helper function to create embedding from text
async function createEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Embedding API error:', error);
    return null;
  }
}

// Helper function to calculate cosine similarity
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

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

// Process embeddings endpoint with progress updates
app.post('/api/process-embeddings', async (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext);
    });

    let processed = 0;
    const total = imageFiles.length;

    // Set up Server-Sent Events for progress updates
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    for (const file of imageFiles) {
      const filePath = path.join(uploadsDir, file);
      
      // Skip if already processed
      if (photoDatabase.has(file)) {
        processed++;
        continue;
      }

      // Analyze image with GPT-4 Vision
      console.log(`Analyzing image ${processed + 1}/${total}: ${file}`);
      const description = await analyzeImageWithVision(filePath);
      
      if (description) {
        console.log(`Creating embedding for: ${file}`);
        // Create embedding from the description
        const embedding = await createEmbedding(description);
        
        if (embedding) {
          photoDatabase.set(file, {
            filename: file,
            path: `/uploads/${file}`,
            description: description,
            embedding: embedding,
            processedAt: new Date().toISOString()
          });
          console.log(`✓ Successfully processed: ${file}`);
        } else {
          console.log(`✗ Failed to create embedding for: ${file}`);
        }
      } else {
        console.log(`✗ Failed to analyze: ${file}`);
      }

      processed++;
      const progress = Math.round((processed / total) * 100);
      
      // Send progress update
      res.write(`data: ${JSON.stringify({ 
        progress, 
        processed, 
        total,
        currentFile: file 
      })}\n\n`);
      
      // Small delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    res.write(`data: ${JSON.stringify({ 
      complete: true, 
      processed, 
      total 
    })}\n\n`);
    
    res.end();
  } catch (error) {
    console.error('Embedding process error:', error);
    res.write(`data: ${JSON.stringify({ 
      error: 'Processing failed', 
      message: error.message 
    })}\n\n`);
    res.end();
  }
});

// Smart search endpoint
app.post('/api/search', async (req, res) => {
  try {
    const { query, useSmartSearch = false } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Search query required' });
    }

    let results = [];

    if (useSmartSearch && photoDatabase.size > 0) {
      // Create embedding for the search query
      const queryEmbedding = await createEmbedding(query);
      
      if (queryEmbedding) {
        // Calculate similarity scores for all photos
        const scoredResults = [];
        
        for (const [filename, data] of photoDatabase) {
          const similarity = cosineSimilarity(queryEmbedding, data.embedding);
          scoredResults.push({
            filename: data.filename,
            path: data.path,
            score: similarity,
            description: data.description
          });
        }
        
        // Sort by similarity and take top 5
        results = scoredResults
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)
          .map(r => ({
            filename: r.filename,
            path: r.path,
            confidence: r.score,
            caption: `${Math.round(r.score * 100)}% match - ${r.description.substring(0, 100)}...`
          }));
      } else {
        // Fallback to keyword matching if embedding fails
        const queryLower = query.toLowerCase();
        const matches = [];
        
        for (const [filename, data] of photoDatabase) {
          if (data.description && data.description.toLowerCase().includes(queryLower)) {
            matches.push({
              filename: data.filename,
              path: data.path,
              caption: data.description.substring(0, 150) + '...'
            });
          }
        }
        
        results = matches.slice(0, 5);
      }
    } else {
      // Basic search - return random photos
      const files = fs.readdirSync(uploadsDir);
      const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext);
      });

      const shuffled = imageFiles.sort(() => 0.5 - Math.random());
      results = shuffled.slice(0, 5).map(file => ({
        filename: file,
        path: `/uploads/${file}`,
        caption: 'Enable smart search for better results'
      }));
    }

    res.json({
      success: true,
      query: query,
      results: results,
      searchType: useSmartSearch ? 'smart' : 'basic'
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
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
      const hasEmbedding = photoDatabase.has(file);
      
      return {
        filename: file,
        path: `/uploads/${file}`,
        size: stats.size,
        uploadDate: stats.birthtime,
        hasEmbedding: hasEmbedding,
        description: hasEmbedding ? photoDatabase.get(file).description : null
      };
    });

    res.json({ 
      photos,
      smartSearchEnabled: photoDatabase.size > 0
    });
  } catch (error) {
    console.error('Error reading photos:', error);
    res.status(500).json({ error: 'Failed to read photos' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    smartSearchReady: photoDatabase.size > 0,
    photosProcessed: photoDatabase.size
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Access from your phone: http://192.168.0.17:${PORT}`);
  console.log(`Smart search with OpenAI Vision enabled`);
  console.log('⚠️  Remember to set your OpenAI API key in the code!');
});