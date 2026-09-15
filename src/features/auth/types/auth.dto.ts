import type { UserEntity } from "../../../entities/user";

// Payload JWT dari backend: npp, name, username, status
export type AuthDTO = Pick<UserEntity, "npp" | "name" | "username">;

// Request payload untuk login
export type LoginDTO = Pick<UserEntity, "username" | "password">;

// Request payload untuk register
export type RegisterDTO = Pick<
  UserEntity,
  "username" | "name" | "email" | "password" | "npp" | "phone"
>;

// Response login dari backend (hanya token)
export interface LoginResponseDTO {
  token: string;
}
