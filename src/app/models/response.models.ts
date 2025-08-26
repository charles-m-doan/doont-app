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
    mode: string;
    type: string;
    sha: string;
    url: string;
    size?: number;
}