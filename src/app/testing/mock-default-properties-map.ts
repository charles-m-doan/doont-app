import { BehaviorSubject } from "rxjs";
import { ShaResponseDto } from "../models/response.models";
import { ApiService } from "../services/api.service";
import { Property } from "./test-util";

export const DEFAULT_MOCK_PROPERTIES_MAP: Map<{ new(...args: any[]): any }, Property[]> = createMockDefaultPropertiesMap();

export function createMockDefaultPropertiesMap(): Map<{ new(...args: any[]): any }, Property[]> {
    let map = new Map<{ new(...args: any[]): any }, Property[]>();

    map.set(ApiService, [
        { name: 'shaResponse$', value: new BehaviorSubject<ShaResponseDto>({ sha: '' }) }
    ]);

    return map;
}