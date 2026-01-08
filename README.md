# Clinical Calendar

**Clinical Calendar** is a modern, mobile-first Progressive Web App (PWA) designed to help medical students and residents manage their rotation schedules with ease.

Built with a focus on simplicity, speed, and a premium "native app" feel, it replaces improved spreadsheets with a clean, color-coded digital dashboard.

## Key Features

### Smart Schedule Management
*   **Personalized Dashboard:** Instantly see your current shift, upcoming rotations, and off-days.
*   **Visual Calendar:** A full monthly view with color-coded dots representing different hospitals.
*   **Excel Import:** Admin tools allow for bulk importing of student schedules directly from Excel/CSV master sheets.

### Hospital-Based Color Coding
Shifts are automatically categorized and styled by hospital location for quick visual recognition:
*   **Community Health:** Blue/Cyan
*   **Dibba Hospital:** Dark Green
*   **Saqr Hospital:** Amber
*   **Al Qasimi General:** Royal Blue
*   **Al Qasimi Women & Child:** Rose
*   **Abdullah Bin Omran:** Purple

### Native PWA Experience
*   **Installable:** Add to your Home Screen for a fullscreen, app-like experience on iOS and Android.
*   **Offline Ready:** Access your schedule anytime, even without an internet connection.
*   **Smooth UX:** Optimized scrolling, touch interactions, and rigid layouts that feel just like a native app.

### Admin & Power Tools
*   **Bulk Updates:** Modify schedules for groups of students instantly.
*   **Override System:** Manage exceptions and individual schedule changes.
*   **Data Portability:** Export data to JSON for backup or transfer.

## Tech Stack
*   **Frontend:** React, Vite, TailwindCSS
*   **Icons:** Lucide React
*   **Storage:** LocalStorage (Client-side persistence)

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/clinical-calendar.git
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```

## License
This project is for educational and clinical management usage.
