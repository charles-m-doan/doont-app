import { GitBlobResponseDto, GitTreeResponseDto, ShaResponseDto } from "./response.models";

export const EMPTY_SHA_RESPONSE: ShaResponseDto = { sha: '' };

export const EMPTY_BLOB_RESPONSE: GitBlobResponseDto = {
    sha: '',
    node_id: '',
    size: 0,
    url: '',
    content: '',
    encoding: 'base64'
};

export const EMPTY_FILE_LIST_RESPONSE: GitTreeResponseDto = {
    sha: '',
    url: '',
    tree: [],
    truncated: false
};