# Whisper Flow

Local speech-to-text with **Alt+P** hotkey. Runs entirely on your machine—no cloud, no tracking.

![Status](https://img.shields.io/badge/status-TypeScript-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- 🎙️ **Local Processing**: All audio stays on your machine
- ⌨️ **Alt+P Hotkey**: Toggle recording with a global keyboard shortcut
- 🚀 **Fast**: TypeScript backend with streaming transcription
- 🎯 **Accurate**: Uses OpenAI Whisper model locally
- 📦 **Zero Dependencies**: No cloud services required
- 🖥️ **Cross-Platform**: Works on Linux, macOS, Windows

## Prerequisites

### Required
- **Node.js** 18+ ([download](https://nodejs.org/))
- **Whisper CLI** - Install from [OpenAI/whisper](https://github.com/openai/whisper)
  ```bash
  pip install openai-whisper
  ```

### For Audio Recording
- **Linux**: Install `alsa-utils` or `pulseaudio`
  ```bash
  sudo apt-get install alsa-utils
  ```
- **macOS**: Works out of the box
- **Windows**: Works out of the box

## Installation

1. **Clone and Install**
   ```bash
   git clone https://github.com/yourusername/whisper-flow.git
   cd whisper-flow
   npm install
   ```

2. **Configure** (optional)
   ```bash
   cp .env.example .env
   # Edit .env to customize model, device, language, etc.
   ```

3. **Start the Server**
   ```bash
   npm run dev
   ```
   Or for production:
   ```bash
   npm run build
   npm start
   ```

4. **Open in Browser**
   Navigate to `http://localhost:3000`

## Usage

### Hotkey
- **Alt+P**: Toggle recording on/off
- **Click Microphone Button**: Start/stop recording
- **Click Close Button**: Close the UI

### Workflow
1. Press **Alt+P** to start recording
2. Speak clearly
3. Press **Alt+P** again to stop and transcribe
4. Text is automatically pasted into the active window/field

## Configuration

Edit `.env` to customize:

```env
# Model size: base.en (small, fast), medium.en, large (accurate, slow)
WHISPER_FLOW_MODEL=base.en

# Device: cpu or cuda (GPU)
WHISPER_FLOW_DEVICE=cpu

# Audio sample rate (16000 is standard)
WHISPER_FLOW_SAMPLE_RATE=16000

# Language detection: en, es, fr, auto, etc.
WHISPER_FLOW_LANGUAGE=en

# Server port
PORT=3000
```

## Architecture

```
whisper-flow/
├── src/
│   └── server.ts          # Express backend + Whisper integration
├── public/
│   └── index.html         # Scaled-down UI (2X smaller)
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript config
```

### Backend Flow
1. Client sends POST to `/api/toggle` to start/stop recording
2. Server records audio using Node.js `record-lpcm16`
3. Whisper CLI transcribes the audio locally
4. Transcription returned to frontend
5. Text ready to paste into active window

### Frontend
- Minimal React-free UI using vanilla JavaScript
- Real-time status polling every 400ms
- Alt+P and click handlers for toggle
- Waveform animation during recording
- 2X scaled down from original (18px buttons, 30px height)

## Performance

- **Model**: Base.en (~140MB) transcribes ~5 second clips in ~2-3 seconds
- **Memory**: ~500MB base, scales with model size
- **CPU**: Single core sufficient; benefits from multi-core
- **GPU**: ~2GB VRAM recommended for CUDA

## Troubleshooting

### "Whisper command not found"
```bash
pip install openai-whisper
```

### No audio input
- Check microphone: `arecord -l` (Linux) or System Preferences (macOS)
- Check device permissions

### Slow transcription
- Use smaller model: `WHISPER_FLOW_MODEL=tiny.en`
- Enable GPU: `WHISPER_FLOW_DEVICE=cuda`
- Check CPU cores: `nproc`

### Alt+P not working
- Browser must have focus
- Some window managers may intercept hotkeys
- Use UI buttons as fallback

## Building from Source

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run build

# Run compiled version
npm start
```

## Development

```bash
# Install dev dependencies (included in npm install)
npm install

# Run with ts-node (hot reload)
npm run dev
```

## API Endpoints

### GET `/api/status`
Returns current recording status and message buffer.

```json
{
  "recording": false,
  "messages": ["Recording…", "Transcribing...", "✓ Hello world"]
}
```

### POST `/api/toggle`
Toggle recording on/off.

```json
{
  "recording": true,
  "messages": ["Recording… press Alt+P again to stop."]
}
```

## Security

- ✅ Audio never leaves your computer
- ✅ No cloud connectivity required
- ✅ All processing is local
- ✅ No tracking or telemetry
- ✅ Open source code

## License

MIT © 2024

## Contributing

Issues and PRs welcome!

## Changelog

### v0.2.0
- TypeScript backend (replaced Python)
- Removed backend dependency on external services
- Scaled UI 2X smaller (18px from 36px)
- Streamlined npm install
- Better error handling

### v0.1.0
- Initial Python version
