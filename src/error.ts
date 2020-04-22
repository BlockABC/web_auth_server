import { HttpException, HttpStatus } from '@nestjs/common'

import { hasKey } from './helper'

export class ParamError extends HttpException {
  static readonly messages = {
    10000: 'Param[{name}] is required.',
    10001: 'Can not find data with Param[{name}].',
  }

  readonly name = 'ParamError'
  readonly code: number

  constructor (code: number, message: string) {
    super({ code, message }, HttpStatus.BAD_REQUEST)
    this.code = code
  }

  static fromCode (code: number, paramName?: string): ParamError {
    let message = hasKey(ParamError.messages, code) ? ParamError.messages[code] : 'Undefined error code'
    if (paramName) {
      message = message.replace('{name}', paramName)
    }

    return new ParamError(code, message)
  }
}

export class ServerError extends HttpException {
  static readonly messages = {
    90000: 'Parse cached data failed.',
  }

  readonly name = 'ServerError'
  readonly code: number

  constructor (code: number, message: string) {
    super({ code, message }, HttpStatus.INTERNAL_SERVER_ERROR)
    this.code = code
  }

  static fromCode (code: number): ParamError {
    const message = hasKey(ServerError.messages, code) ? ServerError.messages[code] : 'Undefined error code'
    return new ParamError(code, message)
  }
}
