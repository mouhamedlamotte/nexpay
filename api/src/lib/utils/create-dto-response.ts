import { ApiProperty } from '@nestjs/swagger';
import {
  BaseDataResponse,
  BasePaginatedResponse,
} from '../dto/api-response-base';

export function createDataResponse<T>(dataType: any, description?: string) {
  class DataResponse extends BaseDataResponse<T> {
    @ApiProperty({ type: dataType, description })
    data: T;
  }
  return DataResponse;
}

export function createPaginatedResponse<T>(
  dataType: any,
  description?: string,
) {
  class PaginatedResponse extends BasePaginatedResponse<T> {
    @ApiProperty({ type: [dataType], description })
    data: T[];
  }
  return PaginatedResponse;
}
