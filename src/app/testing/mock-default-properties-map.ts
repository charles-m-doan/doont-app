import { BehaviorSubject } from "rxjs";
import { GitTreeResponseDto, ShaResponseDto } from "../models/response.models";
import { ApiService } from "../services/api.service";
import { Property } from "./test-util";
import { cloneDeep } from "lodash";
import { EMPTY_FILE_LIST_RESPONSE, EMPTY_SHA_RESPONSE } from "../models/response.constants";

export const DEFAULT_MOCK_PROPERTIES_MAP: Map<{ new(...args: any[]): any }, Property[]> = createMockDefaultPropertiesMap();

export function createMockDefaultPropertiesMap(): Map<{ new(...args: any[]): any }, Property[]> {
    let map = new Map<{ new(...args: any[]): any }, Property[]>();

    map.set(ApiService, [
        { name: 'shaResponse$', value: new BehaviorSubject<ShaResponseDto>(cloneDeep(EMPTY_SHA_RESPONSE)) },
        { name: 'fileListResponse$', value: new BehaviorSubject<GitTreeResponseDto>(cloneDeep(EMPTY_FILE_LIST_RESPONSE)) }
    ]);

    return map;
}