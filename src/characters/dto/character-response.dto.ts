import { Expose, Type } from 'class-transformer';

export class WorldResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;
}

export class OtServerResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  ip: string;

  @Expose()
  port: number;
}

export class CharacterResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  level: number;

  @Expose()
  vocation: string;

  @Expose()
  serverType: string;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;

  @Expose()
  @Type(() => WorldResponseDto)
  world: WorldResponseDto;

  @Expose()
  @Type(() => OtServerResponseDto)
  otServer: OtServerResponseDto;

  // userId não é exposto por segurança
  // user também não é exposto por padrão para evitar recursão
}
