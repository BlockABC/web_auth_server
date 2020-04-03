import * as cookie from 'cookie'
import { createParamDecorator } from '@nestjs/common'

function resolveCookie (req, cookieNames: string[] = ['lang']): string {
  if (!req.cookies && req.headers.cookie) {
    req.cookies = cookie.parse(req.headers.cookie)
  }

  if (req.cookies) {
    for (const i in cookieNames) {
      if (req.cookies[cookieNames[i]]) {
        return req.cookies[cookieNames[i]]
      }
    }
  }

  return undefined
}

function resolveQuery (req, keys: string[] = ['language', 'lang', 'locale']): string {
  let lang: string

  for (const key of keys) {
    if (req.query && req.query[key]) {
      lang = req.query[key]
      break
    }
  }

  return lang
}

function resolveHeader (req, keys = ['accept-language']): string {
  if (req.acceptsLanguages) {
    const accepts = req.acceptsLanguages()

    if (accepts && accepts[0]) {
      return accepts[0]
    }
    return
  }

  let lang: string

  for (const key of keys) {
    if (req.headers[key] !== undefined) {
      lang = req.headers[key]
      break
    }
  }

  return lang
}

export function getLanguage (req): string {
  if (req.language) {
    return req.language
  }

  for (const resolver of [resolveQuery, resolveCookie, resolveHeader]) {
    const result = resolver(req)

    if (result) {
      req.language = result
      return result
    }
  }
}

export const Language = createParamDecorator((data, req) => {
  return getLanguage(req)
})
