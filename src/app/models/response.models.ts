// Response for main latest SHA
export interface ShaResponseDto {
    sha: string;
}

// Response for file list
export interface GitTreeResponsDto {
    sha: string;
    url: string;
    tree: GitTreeEntryDto[];
    truncated: boolean;
}

export interface GitTreeEntryDto {
    path: string;
    mode: string; // e.g. "100644"
    type: string;
    sha: string;
    url: string;
    size?: number; // present on blobs
}