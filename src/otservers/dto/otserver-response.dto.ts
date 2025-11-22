import { Expose, Type } from 'class-transformer';
import { WorldResponseDto } from '../../worlds/dto/world-response.dto';

export class OtServerResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  ip: string;

  @Expose()
  port: number;

  @Expose()
  created_at: Date;

  @Expose()
  @Type(() => WorldResponseDto)
  worlds?: WorldResponseDto[];
}
