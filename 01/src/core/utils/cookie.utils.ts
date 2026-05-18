import type { FastifyReply } from "fastify"

export const setAuthCookies = (
  reply: FastifyReply,
  accessToken: string,
  refreshToken: string,
  isProduction: boolean
) => {
  reply.setCookie('accessToken', accessToken, {
    path: '/',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 900
  })
  reply.setCookie('refreshToken', refreshToken, {
    path: '/',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 604800
  })
}

export const clearAuthCookies = async (reply: FastifyReply) => {
  reply.clearCookie('accessToken', { path: '/' })
  reply.clearCookie('refreshToken', { path: '/' })
}


