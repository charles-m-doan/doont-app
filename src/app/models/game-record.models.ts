export interface GamePlacements {
    first: string | null;
    second: string | null;
    third: string | null;
    fourth: string | null;
}

export interface GameRecordEntry {
    gameNumber: number;
    /** ISO date used for screenshot filenames, e.g. 2025-07-27 */
    dateIso: string;
    placements: GamePlacements;
    startTime: string | null; // HH:mm
    endTime: string | null; // HH:mm
    durationMinutes: number | null;
}
