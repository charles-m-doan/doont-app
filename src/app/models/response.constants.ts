import { GitBlobResponseDto, GitTreeResponseDto, ShaResponseDto } from "./response.models";

export const EMPTY_SHA_RESPONSE: ShaResponseDto = Object.freeze({
    object: {
        sha: ''
    }
});

export const EMPTY_BLOB_RESPONSE: GitBlobResponseDto = Object.freeze({
    sha: '',
    node_id: '',
    size: 0,
    url: '',
    content: '',
    encoding: 'base64'
});

export const EMPTY_FILE_LIST_RESPONSE: GitTreeResponseDto = Object.freeze({
    sha: '',
    url: '',
    tree: [],
    truncated: false
});