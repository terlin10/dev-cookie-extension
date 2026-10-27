export interface CookieItem {
  key: string
  value: string
  originalValue: string
  domain: string
  originalDomain: string
  path: string
  originalPath: string
  secure: boolean
  originalSecure: boolean
  httpOnly: boolean
  originalHttpOnly: boolean
  sameSite: 'no_restriction' | 'lax' | 'strict' | 'unspecified'
  originalSameSite: 'no_restriction' | 'lax' | 'strict' | 'unspecified'
  session: boolean
  originalSession: boolean
  expirationDate?: number
  originalExpirationDate?: number
  isNew?: boolean
}
