# CloudSnap - Real Photo Upload Setup

This setup enables CloudSnap to run on your Mac's IP address (192.168.0.17) and handle real photo uploads from your phone.

## Quick Setup

1. **Make the setup script executable and run it:**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

2. **Start the backend server:**
   ```bash
   cd server
   npm start
   ```

3. **In a new terminal, start the frontend:**
   ```bash
   npm run dev
   ```

4. **Access from your phone:**
   - Open: `http://192.168.0.17:8080`

## Manual Setup (if script doesn't work)

### Backend Server Setup

1. **Create server directory:**
   ```bash
   mkdir server && cd server
   ```

2. **Initialize and install dependencies:**
   ```bash
   npm init -y
   npm install express multer cors
   npm install --save-dev nodemon
   ```

3. **Create `server.js`** (use the server code from the artifacts above)

4. **Start the server:**
   ```bash
   npm start
   ```

### Frontend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

## How It Works

### Real Photo Upload Flow

1. **Permission Request**: The app asks for photo access
2. **Photo Selection**: Click "Select Photos" to choose from your device
3. **Preview**: See thumbnails of selected photos with total size
4. **Upload**: Click "Upload" to send photos to the server
5. **Progress**: Real progress bar based on actual upload
6. **Completion**: Shows actual number of photos and MB uploaded

### File Storage

- Photos are uploaded to `server/uploads/` directory
- Each photo gets a unique filename to prevent conflicts
- Original filenames are preserved in the database response

### Gallery & Search

- **Gallery**: Shows real uploaded photos in a masonry layout
- **Search**: Returns random selection of your uploaded photos
- **No Photos State**: Prompts user to upload photos if none exist

## API Endpoints

- `POST /api/upload` - Upload photos
- `GET /api/photos` - Get all uploaded photos
- `GET /api/health` - Health check
- `GET /uploads/:filename` - Serve uploaded images

## Network Configuration

The app is configured to run on your specific IP:
- **Frontend**: `http://192.168.0.17:8080`
- **Backend**: `http://192.168.0.17:8081`

## File Structure

```
cloudsnap-chat-photos/
├── server/
│   ├── uploads/          # Uploaded photos
│   ├── server.js         # Express server
│   └── package.json      # Server dependencies
├── src/
│   ├── components/
│   │   └── cloudsnap/
│   │       ├── PhotoUploadBubble.tsx  # Real file upload
│   │       ├── GalleryView.tsx        # Real photo gallery
│   │       └── SearchView.tsx         # Real photo search
│   └── ...
└── package.json          # Frontend dependencies
```

## Features Added

✅ **Real Photo Selection**: Native file input for selecting photos  
✅ **Actual Upload**: Photos uploaded to server with progress tracking  
✅ **File Validation**: Only image files accepted  
✅ **Size Calculation**: Real file sizes displayed and uploaded  
✅ **Photo Storage**: Files saved to server/uploads directory  
✅ **Gallery Integration**: Gallery shows actual uploaded photos  
✅ **Search Integration**: Search results use real photos  
✅ **Network Access**: Accessible from phone via IP address  

## Testing on Phone

1. **Ensure both devices are on the same WiFi network**
2. **Make sure Mac firewall allows connections on ports 8080 and 8081**
3. **Access `http://192.168.0.17:8080` from your phone's browser**
4. **Select photos using your phone's native photo picker**
5. **Upload and see them appear in the gallery**

## Troubleshooting

- **Cannot access from phone**: Check firewall settings and WiFi network
- **Upload fails**: Ensure server is running on port 8081
- **Photos don't appear**: Check `server/uploads` directory permissions
- **CORS errors**: Server includes CORS headers, restart if needed
