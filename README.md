# 📖 Al Quran - Digital Reading Experience

A beautifully crafted, modern, and responsive web application for reading and listening to the Holy Quran. Built with React, TypeScript, and Tailwind CSS, this application provides a seamless and distraction-free environment for spiritual reflection.

## ✨ Features

- **📖 Complete Quran Text:** Access all 114 Surahs with original Arabic text (Uthmani script).
- **🌍 Multiple Translations:** Read the Quran in multiple languages simultaneously:
  - English (Saheeh International)
  - Portuguese (Samir El-Hayek)
  - Bengali (Muhiuddin Khan)
- **🎧 Audio Playback:** Listen to high-quality audio recitations (Mishary Rashid Alafasy) for each Ayah.
- **🔗 Smart URL Sharing:** Share specific Surahs, Ayahs, and your preferred language selections easily via clean URLs (e.g., `?langs=arabic,english,portuguese&surah=2&ayah=4`).
- **🔖 Bookmarking:** Save your progress by bookmarking specific Ayahs. Your bookmarks are saved locally on your device.
- **📱 Responsive Design:** A mobile-first, highly responsive UI that looks beautiful on phones, tablets, and desktop computers.
- **🎨 Modern UI/UX:** Clean typography, smooth transitions, and an intuitive interface designed for readability.

## 🛠️ Technologies Used

- **Frontend Framework:** [React 18](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Data Source:** [AlQuran Cloud API](https://alquran.cloud/api)

## 🚀 Getting Started

To run this project locally, follow these steps:

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/iammuttaqi/al-quran.git
   ```
2. Navigate into the project directory:
   ```bash
   cd al-quran-app
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Development Server

Start the Vite development server:

```bash
npm run dev
```

Open your browser and visit `http://localhost:3000` to view the application.

## 📡 API Reference

This application uses the free and open-source [AlQuran Cloud API](https://alquran.cloud/api) to fetch Surah lists, Arabic text, translations, and audio files.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
