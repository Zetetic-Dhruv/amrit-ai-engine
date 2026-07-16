# AMRIT Convenience-First Prototype

AMRIT is a local, single-user application that converts village survey workbooks into reviewable provider recommendations. Uploaded data and the SQLite database stay on the machine.

## Start locally

Requirements: Node.js 20 or newer and Ollama.

```bash
cp .env.example .env.local
npm install
npm run fixtures
ollama pull qwen2.5:14b
ollama pull nomic-embed-text
ollama serve
```

In another terminal:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On first run, upload `fixtures/sample-provider-catalogue.csv`, then try `fixtures/sample-village-survey.xlsx`.

## Input formats

Survey workbooks use the first worksheet, one village per row, a required `Village Name` column, and question columns such as `Q1` or `Q1.1`. Answers are `Yes`, `No`, or `NA`.

Provider catalogues require `Provider Name` and `Description`. Optional columns are `Track Tags`, `Contact Name`, `Contact Email`, and `Contact Phone`.

The current taxonomy and rules are synthetic starter content. Replace `config/tracks.json` and `config/rules.yaml` with approved RSVC material before treating results as domain-faithful.

## Commands

```bash
npm run dev       # localhost development server
npm run build     # production build check
npm test          # unit and local-pipeline tests
npm run test:e2e  # complete first-run and review flow
npm run lint      # static checks
npm run fixtures  # regenerate XLSX fixtures
```

Local application data is stored in `.data/`. Stop AMRIT and remove that directory to reset first-run setup.
