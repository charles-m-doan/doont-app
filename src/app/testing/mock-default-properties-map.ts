import { BehaviorSubject } from "rxjs";
import { GitBlobResponseDto, GitTreeResponseDto, ShaResponseDto } from "../models/response.models";
import { ApiService } from "../services/api.service";
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

    return map;
}