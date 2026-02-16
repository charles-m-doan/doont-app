# Doont
https://charles-m-doan.github.io/doont-app

## Local data mode (no GitHub fetch)

Browsers can't read from `C:\\...` paths directly, so local mode uses a tiny local HTTP server that serves your OneDrive folder.

- Start the local server (PowerShell):
	- `$env:DOONT_LOCAL_DIR="C:\\Users\\cmatt\\OneDrive\\doont"; npm run local-data`
- Start the Angular app: `npm start`
- Open the app with local mode enabled:
	- `http://localhost:4200/?local=1`
	- Optional: override server URL: `http://localhost:4200/?local=1&localBaseUrl=http://localhost:4173`

Local server endpoints:
- `GET http://localhost:4173/__tree`
- `GET http://localhost:4173/__file?path=Doont.xlsx`
- `GET http://localhost:4173/__file?path=screenshots/2025-01-01.png`
