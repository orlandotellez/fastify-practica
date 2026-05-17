import type { IUserEntity } from "./auth.entities"
import type { IRegisterPayload } from "./auth.types"

export interface IAuthRepository {
  findByEmail(email: string): Promise<IUserEntity | null>
  create(data: IRegisterPayload): Promise<IUserEntity>
}
