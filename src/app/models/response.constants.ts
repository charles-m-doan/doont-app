import { GitBlob, ShaResponseDto } from "./response.models";

export const EMPTY_SHA_RESPONSE: ShaResponseDto = { sha: '' };

export const EMPTY_BLOB_RESPONSE: GitBlob = {
    sha: '',
    node_id: '',
    size: 0,
    url: '',
    content: '',
    encoding: 'base64'
};