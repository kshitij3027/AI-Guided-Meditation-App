# Guided Meditation App

A responsive web application for guided meditation built with FastAPI, DaisyUI, and Anime.js.

## Features

- Four different meditation types: Mindfulness, Relaxation, Sleep, and Focus
- Voice narration for guided meditation instructions
- Customizable voice settings (speed and pitch)
- Dark and light mode toggle with smooth transitions
- Responsive design for mobile and desktop
- Beautiful breathing animations using Anime.js
- Step-by-step guided meditation instructions

## Tech Stack

- **Backend**: FastAPI
- **Frontend**: HTML, CSS, JavaScript
- **UI Framework**: Tailwind CSS with DaisyUI
- **Animations**: Anime.js
- **Voice Synthesis**: Web Speech API

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Run the application:
   ```
   python main.py
   ```
4. Open your browser and navigate to `http://127.0.0.1:8000`

## Project Structure

```
guided-meditation/
├── main.py                # FastAPI application entry point
├── requirements.txt       # Python dependencies
├── static/                # Static assets
│   ├── css/               # CSS stylesheets
│   │   └── styles.css     # Custom styles
│   ├── js/                # JavaScript files
│   │   └── main.js        # Main application logic
│   └── images/            # Image assets
└── templates/             # HTML templates
    └── index.html         # Main application page
```

## Usage

1. Select one of the four meditation types
2. Follow the on-screen instructions (both visual and audio)
3. Use the voice settings to adjust the narration to your preference
4. Use the pause/resume button to control the meditation
5. Click stop when you're finished

## Voice Narration

The app uses the Web Speech API to provide voice narration for the meditation instructions. This allows users to close their eyes and focus on meditating while still receiving guidance.

Features:
- Toggle voice narration on/off
- Adjust speech rate (slower for more relaxed meditation)
- Adjust pitch to find a comfortable voice
- Automatic pausing and resuming of speech with meditation controls

## Customization

You can customize the meditation instructions by modifying the meditation data in `main.py`. 