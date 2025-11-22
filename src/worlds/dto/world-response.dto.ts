import { Expose } from 'class-transformer';

export class WorldResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  isGlobal: boolean;

  @Expose()
  created_at: Date;
}
