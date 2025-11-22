import { Expose, Type } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  full_name: string;

  @Expose()
  phone: string;

  @Expose()
  country: string;

  @Expose()
  state: string;

  @Expose()
  city: string;

  @Expose()
  zip_code: string;

  @Expose()
  address: string;

  @Expose()
  address_2: string;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;

  // Senha NUNCA é exposta por não ter @Expose()
  // lobbiesOwned e lobbiesJoined também não são expostos por padrão
}
