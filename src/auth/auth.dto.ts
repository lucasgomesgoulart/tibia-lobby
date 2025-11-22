import { Expose } from 'class-transformer';

export class AuthResponseDto {
  @Expose()
  access_token: string;

  @Expose()
  expiresIn: number;

  @Expose()
  userId: string;
}

// Mantém compatibilidade (deprecated)
export class authResponseDto extends AuthResponseDto {}
