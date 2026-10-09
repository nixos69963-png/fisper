import express, { Request, Response } from 'express';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import recorder from 'node-record-lpcm16';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3000;

interface RecordingSession {
  id: string;
  isRecording: boolean;
  audioFile: string;
  stream?: NodeJS.ReadWriteStream;
}

interface TranscriptionResult {
  text: string;
}

const SAMPLE_RATE = parseInt(process.env.WHISPER_FLOW_SAMPLE_RATE || '16000');
const MODEL = process.env.WHISPER_FLOW_MODEL || 'base.en';
const DEVICE = process.env.WHISPER_FLOW_DEVICE || 'cpu';
const COMPUTE_TYPE = process.env.WHISPER_FLOW_COMPUTE || 'int8';
const LANGUAGE = process.env.WHISPER_FLOW_LANGUAGE || 'en';

let currentSession: RecordingSession = {
  id: uuidv4(),
  isRecording: false,
  audioFile: '',
};

const messagesBuffer: string[] = [];

// Serve static files
app.use(express.static('public'));

// API endpoints
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    recording: currentSession.isRecording,
    messages: messagesBuffer.slice(-10), // Last 10 messages
  });
});

app.post('/api/toggle', async (req: Request, res: Response) => {
  try {
    if (currentSession.isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
    res.json({
      recording: currentSession.isRecording,
      messages: messagesBuffer,
    });
  } catch (error) {
    console.error('Error toggling recording:', error);
    res.status(500).json({ error: String(error) });
  }
});

async function startRecording() {
  if (currentSession.isRecording) return;

  currentSession = {
    id: uuidv4(),
    isRecording: true,
    audioFile: path.join('/tmp', `whisper-flow-${currentSession.id}.wav`),
  };

  messagesBuffer.push('Recording… press Alt+P again to stop.');
  console.log('[Whisper Flow] Recording started...');

  // Create write stream for audio
  const writeStream = fs.createWriteStream(currentSession.audioFile);

  currentSession.stream = recorder
    .record({
      sampleRate: SAMPLE_RATE,
      channels: 1,
      compress: false,
      audioType: 'wav',
    })
    .stream()
    .pipe(writeStream);

  return new Promise<void>((resolve) => {
    currentSession.stream?.on('finish', resolve);
  });
}

async function stopRecording() {
  if (!currentSession.isRecording) return;

  currentSession.isRecording = false;
  messagesBuffer.push('Transcribing...');
  console.log('[Whisper Flow] Recording stopped. Transcribing...');

  // Stop the recorder
  recorder.stop();

  // Wait for file to be written
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    // Transcribe using whisper CLI
    const transcript = await transcribeWithWhisper(currentSession.audioFile);

    if (transcript.trim()) {
      messagesBuffer.push(`✓ ${transcript}`);
      console.log('[Whisper Flow] Transcribed:', transcript);

      // Paste the text (would be handled by frontend in browser environment)
      console.log('[Whisper Flow] Ready to paste:', transcript);
    }
  } catch (error) {
    messagesBuffer.push(`Error: ${String(error)}`);
    console.error('[Whisper Flow] Transcription error:', error);
  } finally {
    // Cleanup audio file
    if (fs.existsSync(currentSession.audioFile)) {
      fs.unlinkSync(currentSession.audioFile);
    }
  }
}

async function transcribeWithWhisper(audioFile: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Check if whisper CLI is available
    const whisperProcess = spawn('whisper', [
      audioFile,
      '--model',
      MODEL,
      '--language',
      LANGUAGE,
      '--output_format',
      'txt',
      '--output_dir',
      '/tmp',
      '--device',
      DEVICE === 'gpu' ? 'cuda' : 'cpu',
      '--fp16',
      DEVICE === 'gpu' ? 'True' : 'False',
    ]);

    let output = '';
    let error = '';

    whisperProcess.stdout?.on('data', (data) => {
      output += data.toString();
    });

    whisperProcess.stderr?.on('data', (data) => {
      error += data.toString();
      console.log('[Whisper Flow]', data.toString());
    });

    whisperProcess.on('close', (code) => {
      if (code === 0) {
        // Read the output file
        const outputFile = audioFile.replace('.wav', '.txt');
        try {
          if (fs.existsSync(outputFile)) {
            const text = fs.readFileSync(outputFile, 'utf-8').trim();
            fs.unlinkSync(outputFile);
            resolve(text);
          } else {
            resolve('');
          }
        } catch (err) {
          reject(err);
        }
      } else {
        reject(new Error(`Whisper failed: ${error}`));
      }
    });

    whisperProcess.on('error', (err) => {
      reject(new Error(`Failed to start whisper: ${err.message}`));
    });
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`[Whisper Flow] Server running on http://localhost:${PORT}`);
  console.log(`[Whisper Flow] Model: ${MODEL}`);
  console.log(`[Whisper Flow] Local mode; no audio leaves this computer.`);
  console.log(`[Whisper Flow] Use the UI to toggle recording or Alt+P hotkey`);
});
