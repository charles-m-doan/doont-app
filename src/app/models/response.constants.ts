import { cloneDeep } from "lodash";
import { GitBlobResponseDto, GitTreeResponseDto, ShaResponseDto } from "./response.models";

export const EMPTY_SHA_RESPONSE: ShaResponseDto = Object.freeze({
    object: {
        sha: ''
    }
});
export function emptyShaResponse(): ShaResponseDto {
    return cloneDeep(EMPTY_SHA_RESPONSE);
}

export const EMPTY_BLOB_RESPONSE: GitBlobResponseDto = Object.freeze({
    sha: '',
    node_id: '',
    size: 0,
    url: '',
    content: '',
    encoding: 'base64'
});
export function emptyBlobResponse(): GitBlobResponseDto {
    return cloneDeep(EMPTY_BLOB_RESPONSE);
}

export const EMPTY_FILE_LIST_RESPONSE: GitTreeResponseDto = Object.freeze({
    sha: '',
    url: '',
    tree: [],
    truncated: false
});
export function emptyFileListResponse(): GitTreeResponseDto {
    return cloneDeep(EMPTY_FILE_LIST_RESPONSE);
}