export interface ApiError {
    status: number;
    message: string;
    method: string;
    url: string;
}

// Response for main latest SHA
export interface ShaResponseDto {
    sha: string;
}

// Response for file list
export interface GitTreeResponseDto {
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

export interface GitBlobResponseDto {
    sha: string;
    node_id: string;
    size: number;
    url: string;
    content: string; // base64 payload
    encoding: 'base64' | string;
}