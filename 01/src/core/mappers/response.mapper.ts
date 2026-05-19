import type { Role, User } from "@/types/auth";

export function mapUserToResponse(user: User): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    email_verified: user.email_verified,
    role: user.role as Role,
    phone: user.phone || undefined,
    image: user.image || undefined,
    created_at: user.created_at,
    updated_at: user.updated_at,
    deleted_at: user.deleted_at || undefined
  }
}
