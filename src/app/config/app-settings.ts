export const APP_SETTINGS = {
    // When true, the app will load Doont.xlsx + screenshots from a local HTTP server
    // instead of pulling from GitHub.
    isLocal: false,

    // Base URL for the local data server started by `npm run local-data`.
    // You can override this at runtime with `?localBaseUrl=http://localhost:4173`.
    localDataBaseUrl: 'http://localhost:4173'
} as const;
