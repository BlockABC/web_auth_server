import { ParamError, ServerError } from '../error'

expect.extend({
  /**
   * ParamError Matcher
   *
   * @param {Function} received
   * @param {number} expected
   * @returns {{pass: *, message: (function(): string)}}
   */
  toThrowParamError (err, expected) {
    let pass = false
    let message = `Expected ParamError:${expected} to be thrown`

    if (err instanceof ParamError) {
      if (err.code === expected) {
        pass = true
      }
      else {
        message = `Expected ParamError:${err.code} to be ParamError:${expected}`
      }
    }
    else {
      message = `Expected Error:${err.message} to be ParamError:${expected}`
    }

    return { pass, message: (): string => message }
  },
  /**
   * ServerError Matcher
   *
   * @param {Function} received
   * @param {number} expected
   * @returns {{pass: *, message: (function(): string)}}
   */
  toThrowServerError (err, expected) {
    let pass = false
    let message = `Expected ServerError:${expected} to be thrown`

    if (err instanceof ServerError) {
      if (err.code === expected) {
        pass = true
      }
      else {
        message = `Expected ServerError:${err.code} to be ServerError:${expected}`
      }
    }
    else {
      message = `Expected Error:${err.message} to be ServerError:${expected}`
    }

    return { pass, message: (): string => message }
  },
})
