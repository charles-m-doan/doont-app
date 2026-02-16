import { BehaviorSubject, of } from "rxjs";
import { GitBlobResponseDto, GitTreeResponseDto, ShaResponseDto } from "../models/response.models";
import { ApiService } from "../services/api.service";
import { LocalDataApiService } from "../services/local-data-api.service";
import { Property } from "./mocking-util";
import { emptyBlobResponse, emptyFileListResponse, emptyShaResponse } from "../models/response.constants";

export const DEFAULT_MOCK_PROPERTIES_MAP: Map<{ new(...args: any[]): any }, Property[]> = Object.freeze(createMockDefaultPropertiesMap());

export function createMockDefaultPropertiesMap(): Map<{ new(...args: any[]): any }, Property[]> {
    let map = new Map<{ new(...args: any[]): any }, Property[]>();

    map.set(ApiService, [
        { name: 'shaResponse$', value: new BehaviorSubject<ShaResponseDto>(emptyShaResponse()) },
        { name: 'fileListResponse$', value: new BehaviorSubject<GitTreeResponseDto>(emptyFileListResponse()) },
        { name: 'blobResponse$', value: new BehaviorSubject<GitBlobResponseDto>(emptyBlobResponse()) }
    ]);

    // LocalDataApiService is only used in "local mode", but DataService creates the observable at startup.
    // Provide safe defaults so unit tests don't require HttpClient.
    map.set(LocalDataApiService, [
        { name: 'getTree$', value: (_baseUrl: string) => of([] as string[]) },
        { name: 'getFileBase64$', value: (_baseUrl: string, p: string) => of({ path: p, base64: '' }) }
    ]);

    return map;
}