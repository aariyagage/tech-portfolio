# Tech Portfolio

Personal portfolio of Aariya Gage. AI Engineer | Content Creator. Graduating ASU, May 2026.

Horizontal-scroll portfolio built around a video-editing metaphor: REC indicator, timecode, timeline strip, six "clips" (Intro, About, Projects, Craft, Experience, Export).

## Stack

- React 18 + Vite
- Tailwind CSS
- Framer Motion
- Deployed on Vercel

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
```

Outputs to `dist/`. Preview the production build with `npm run preview`.

## Structure

```
src/
  App.jsx              Main app, sections, scroll engine
  main.jsx             Entry point + ErrorBoundary
  components/
    ExportModal.jsx    Contact modal (Export section CTA)
    GitHubTicker.jsx   Live GitHub commits/repos widget
    TimelineStrip.jsx  Bottom timeline with section clips
    ProjectPreview.jsx Hover preview + modal trigger
    ProjectDetailModal.jsx  Project deep-dive modal
    ErrorBoundary.jsx  Graceful render-failure fallback
public/
  *.webp               Optimized images
  robots.txt
  sitemap.xml
  vite.svg             Favicon
```

## Contact

- Email: aariyagage@gmail.com
- GitHub: [github.com/aariyagage](https://github.com/aariyagage)
- LinkedIn: [linkedin.com/in/aariya-gage-88468924a](https://www.linkedin.com/in/aariya-gage-88468924a)
- Instagram: [@yourstrulyaariya](https://instagram.com/yourstrulyaariya)
