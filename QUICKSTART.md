# Quick Start Guide

## 1️⃣ Prerequisites (5 minutes)

### Install Node.js
- Download from [nodejs.org](https://nodejs.org/) (18+ required)
- Verify: `node --version` (should be v18+)

### Install Whisper
```bash
pip install openai-whisper
```
- If you don't have Python: [Download Python 3.8+](https://www.python.org/downloads/)
- Verify: `whisper --version`

### Linux Only: Audio Support
```bash
sudo apt-get install alsa-utils
```

## 2️⃣ Clone & Setup (2 minutes)

```bash
# Clone the repository
git clone https://github.com/yourusername/whisper-flow.git
cd whisper-flow

# Install npm dependencies
npm install
```

## 3️⃣ Run (1 minute)

```bash
npm run dev
```

You'll see:
```
[Whisper Flow] Server running on http://localhost:3000
[Whisper Flow] Model: base.en
[Whisper Flow] Local mode; no audio leaves this computer.
```

## 4️⃣ Open in Browser

Click → http://localhost:3000

Or open a new browser tab and paste: `http://localhost:3000`

## 5️⃣ Use It!

### Start Recording
Press **Alt+P** or click the microphone button

### Stop & Transcribe
Press **Alt+P** again

The text automatically appears in the focused window/field

## 🎯 Tips

- **Better accuracy**: Use smaller models for fast demo, larger models for production
  ```bash
  WHISPER_FLOW_MODEL=medium.en npm run dev
  ```

- **GPU acceleration** (if you have NVIDIA/CUDA):
  ```bash
  WHISPER_FLOW_DEVICE=cuda npm run dev
  ```

- **Different language**:
  ```bash
  WHISPER_FLOW_LANGUAGE=es npm run dev  # Spanish
  ```

## ❓ Troubleshooting

### "Port 3000 already in use"
```bash
PORT=3001 npm run dev  # Use different port
```

### "Whisper not found"
```bash
pip install openai-whisper --upgrade
```

### No audio input
- Check microphone in system settings
- Linux: Run `arecord -l` to list devices

### Alt+P not working in some apps
- Use the UI buttons as fallback
- Some apps may not allow global hotkeys (security)

## 📚 Next Steps

1. **Customize** the model/language in `.env`
2. **Build** for production: `npm run build && npm start`
3. **Deploy** to your server if needed
4. **Contribute** improvements to GitHub

## 🆘 Help

- Check [README.md](./README.md) for full documentation
- Open an issue on GitHub
- Review error messages in the terminal

Enjoy! 🎉
