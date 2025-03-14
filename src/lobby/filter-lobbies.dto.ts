import { IsOptional, IsString, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterLobbiesDto {
  @IsOptional()
  @IsString()
  title?: string;

  // Para filtrar pela atividade, passamos o ID
  @IsOptional()
  @IsUUID()
  activityTypeId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minLevel?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxLevel?: number;

  // Parâmetros de paginação
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  skip?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  take?: number;
}
