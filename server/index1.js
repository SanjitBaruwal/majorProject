const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 5001;

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

// Serve static files (processed images)
app.use(
  '/processed',
  express.static(
    path.join(
      __dirname,
      'character_recognition_model',
      'image_detection',
      'outputs',
      'output'
    )
  )
);

// Serve static files (processed videos)
app.use(
  '/processed',
  express.static(
    path.join(
      __dirname,
      'character_recognition_model',
      'video_detection',
      'outputs',
      'video_output'
    )
  )
);

// Multer configuration for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/processImage', upload.single('image'), (req, res) => {
    // Create the 'temp' directory if it doesn't exist
    const tempDir = './temp';
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
  
    // Save the received image to a temporary file
    const imageBuffer = req.file.buffer;
    const tempImagePath = path.join(tempDir, 'temp_image.jpg');
  
    fs.writeFileSync(tempImagePath, imageBuffer);
  
    // Full path to your Python script
    const pythonScriptPath = path.join(__dirname, 'character_recognition_model', 'image_detection', 'py_codes', 'predict_text_image_ultraNew3.py');
  
    // Run the Python script with the saved image path
    const pythonProcess = spawn('python', [pythonScriptPath, tempImagePath]);
  
    pythonProcess.stdout.on('data', (data) => {
      console.log(`Python script output: ${data}`);
    });
  
    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python script error: ${data}`);
    });
  
    pythonProcess.on('close', (code) => {
      console.log(`Python script closed with code ${code}`);
  
      // Send a response back to the frontend with the image path
      const outputImagePath = 'processed/output_output_image.jpg';
      res.json({ success: true, imagePath: outputImagePath });
    });
  });


app.post('/processVideo', upload.single('video'), (req, res) => {
  // Create the 'temp' directory if it doesn't exist
  const tempDir = './temp';
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  // Save the received video to a temporary file
  const videoBuffer = req.file.buffer;
  const tempVideoPath = path.join(tempDir, 'temp_video.mp4');

  fs.writeFileSync(tempVideoPath, videoBuffer);

  // Full path to your Python script for video processing
  const pythonScriptPath = path.join(
    __dirname,
    'character_recognition_model',
    'Video_detection',
    'py_codes',
    'predict_text_video_ultraNew3.py'
  );

  // Run the Python script with the saved video path
  const pythonProcess = spawn('python', [pythonScriptPath, tempVideoPath]);

  pythonProcess.stdout.on('data', (data) => {
    console.log(`Python script output: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python script error: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Python script closed with code ${code}`);

    // Send a response back to the frontend with the video path
    const outputVideoPath = 'processed//output_compatible.mp4';
    res.json({ success: true, videoPath: outputVideoPath });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
