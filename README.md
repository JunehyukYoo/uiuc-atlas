# **UIUC Atlas**: _Mapping Student Experience and Emotion Across Campus Spaces_

## About

UIUC Atlas is a capstone project created as part of the **Global Leaders Program** at the University of Illinois Urbana-Champaign. The Global Leaders Program challenges students to apply interdisciplinary thinking to real-world problems, and this project sits at the intersection of **Human-Centered Design** (HCD) and computer science.

One of the core lessons from the program is that representing the voices of _all_ individuals in a given issue is inherently difficult, particularly within multicultural contexts. Systems are often designed around an assumed "common" or average user - an approach that, while scalable, frequently causes the experiences of underrepresented groups to go unnoticed. UIUC Atlas is a direct response to that problem.

The project is a **digital, interactive map** that visualizes how students emotionally experience campus spaces. Rather than labeling locations purely by function or infrastructure, it invites students and faculty to reflect on how specific places make them feel, and aggregates those responses into a collective, evolving emotional geography of campus.

The goal is not to validate obvious assumptions (e.g. that the library is stressful during finals, or that the Quad feels pleasant in spring). It's to **surface patterns, contradictions, and disparities** in how the same shared environments are experienced differently across individuals and contexts. By making emotional responses spatially visible, UIUC Atlas challenges assumptions of uniform experience and invites reflection on how design, identity, and context shape student life on campus.

The broader question the project asks: _How might campus spaces be experienced differently than they were intended — and what becomes visible when those experiences are mapped collectively?_

### Data Collection

Participation is entirely anonymous. Each submission includes:

- A selected location on campus (via map pin placement)
- A discrete emotional category (e.g., Calm, Stressed, Inspired, Lonely, Frustrated, Energized)
- An intensity level (1–5)
- An optional short written reflection (up to 280 characters)
- An optional identity tag (e.g., international student, first-generation, commuter)

### Visualization

The map supports two views:

- **Pin view** — displays individual submissions, filterable by identity tag
- **Heatmap view** — renders a collective emotional field across campus, filterable by emotion type

Each emotion maps to a distinct color hue, with intensity and submission density influencing saturation and brightness. A per-emotion filter in the heatmap view allows users to disentangle overlapping emotional layers and examine where specific feelings concentrate — rather than interpreting an averaged, visually flattened surface.

The visualization is not intended to present emotional data as truth, but as a **reflective lens** that pushes viewers to reconsider how space, design, and experience interact.

### Exhibition

This project was exhibited as part of the Global Leaders Program capstone showcase at the **Lincoln Hall** (May 6–8, 2025). The exhibition was structured as a self-guided, three-booth experience:

- **Booth 1** — Visitors reflected on a campus space that evoked a strong personal emotion.
- **Booth 2** — Visitors roleplayed as campus designers, sketching a new student space and confronting the question: _who did you design it for, and who did you forget?_
- **Booth 3** — Visitors encountered the UIUC Atlas website, where individual emotional experience becomes visible at scale.

## Technical Details

### Tech Stack

| Layer         | Technology                                                  |
| ------------- | ----------------------------------------------------------- |
| Frontend      | React, TypeScript, Vite                                     |
| Mapping       | Leaflet, react-leaflet, leaflet.heat, react-leaflet-cluster |
| UI Components | Shadcn UI, Tailwind CSS                                     |
| Validation    | Zod (shared schemas between frontend and backend)           |
| Backend       | Node.js, Express                                            |
| ORM           | Prisma                                                      |
| Database      | PostgreSQL                                                  |

### Project Structure

```
uiuc-atlas/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── sidebar/         # SubmissionForm, SubmissionDetail,
│   │   │   │                    #   HeatmapControls, ViewToggle
│   │   │   └── map/             # HeatmapLayer, pin markers, clustering
│   │   ├── schemas/             # Shared Zod schemas
│   │   └── lib/                 # EMOTION_META and other constants
└── backend/
    ├── prisma/
    │   └── schema.prisma
    └── src/
        └── routes/              # Express API routes
```

### Running Locally

**Prerequisites:** Node.js, PostgreSQL

```bash
# Clone the repo
git clone https://github.com/your-username/uiuc-atlas.git
cd uiuc-atlas

# Backend
cd backend
npm install
npx prisma migrate dev
npm run dev

# Frontend (in a separate terminal)
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:3000`.
