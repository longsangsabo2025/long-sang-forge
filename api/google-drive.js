const { google } = require('googleapis');
const multer = require('multer');
const express = require('express');

// Initialize Google Drive API client
const initializeDriveClient = () => {
  try {
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountKey) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON environment variable is not set');
    }

    const credentials = JSON.parse(serviceAccountKey);
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.metadata'
      ],
    });

    return google.drive({ version: 'v3', auth });
  } catch (error) {
    console.error('Failed to initialize Google Drive client:', error);
    throw error;
  }
};

const drive = initializeDriveClient();
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// List files and folders
router.get('/list/:folderId?', async (req, res) => {
  try {
    const folderId = req.params.folderId || 'root';
    
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      pageSize: 100,
      fields: 'files(id,name,mimeType,size,modifiedTime,webViewLink,webContentLink,thumbnailLink,parents,owners)',
      orderBy: 'modifiedTime desc',
    });

    const items = response.data.files || [];
    
    const files = [];
    const folders = [];

    items.forEach((item) => {
      if (item.mimeType === 'application/vnd.google-apps.folder') {
        folders.push({
          id: item.id,
          name: item.name,
          modifiedTime: item.modifiedTime,
          parents: item.parents,
        });
      } else {
        files.push({
          id: item.id,
          name: item.name,
          mimeType: item.mimeType,
          size: item.size,
          modifiedTime: item.modifiedTime,
          webViewLink: item.webViewLink,
          webContentLink: item.webContentLink,
          thumbnailLink: item.thumbnailLink,
          parents: item.parents,
          owners: item.owners,
        });
      }
    });

    res.json({ files, folders });
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// Upload file
router.post('/upload/:parentId?', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const parentId = req.params.parentId || 'root';
    
    const fileMetadata = {
      name: req.file.originalname,
      parents: parentId === 'root' ? undefined : [parentId],
    };

    const media = {
      mimeType: req.file.mimetype,
      body: req.file.buffer,
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id,name,mimeType,size,modifiedTime,parents',
    });

    res.json({
      id: response.data.id,
      name: response.data.name,
      mimeType: response.data.mimeType,
      size: response.data.size,
      modifiedTime: response.data.modifiedTime,
      parents: response.data.parents,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Create folder
router.post('/folder', async (req, res) => {
  try {
    const { name, parentId } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    const fileMetadata = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId && parentId !== 'root' ? [parentId] : undefined,
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id,name,modifiedTime,parents',
    });

    res.json({
      id: response.data.id,
      name: response.data.name,
      modifiedTime: response.data.modifiedTime,
      parents: response.data.parents,
    });
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// Delete file or folder
router.delete('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    await drive.files.delete({
      fileId,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Download file
router.get('/download/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // Get file metadata first
    const fileMetadata = await drive.files.get({
      fileId,
      fields: 'name,mimeType',
    });

    // Download file content
    const response = await drive.files.get({
      fileId,
      alt: 'media',
    }, { responseType: 'stream' });

    res.setHeader('Content-Disposition', `attachment; filename="${fileMetadata.data.name}"`);
    res.setHeader('Content-Type', fileMetadata.data.mimeType);
    
    response.data.pipe(res);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Share file
router.post('/share/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { email, role = 'reader' } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    await drive.permissions.create({
      fileId,
      requestBody: {
        role,
        type: 'user',
        emailAddress: email,
      },
      sendNotificationEmail: true,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error sharing file:', error);
    res.status(500).json({ error: 'Failed to share file' });
  }
});

// Search files
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    
    const response = await drive.files.list({
      q: `name contains '${query}' and trashed=false`,
      pageSize: 50,
      fields: 'files(id,name,mimeType,size,modifiedTime,webViewLink,parents,owners)',
      orderBy: 'modifiedTime desc',
    });

    const files = response.data.files || [];
    
    res.json(files.map(file => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size,
      modifiedTime: file.modifiedTime,
      webViewLink: file.webViewLink,
      parents: file.parents,
      owners: file.owners,
    })));
  } catch (error) {
    console.error('Error searching files:', error);
    res.status(500).json({ error: 'Failed to search files' });
  }
});

module.exports = router;