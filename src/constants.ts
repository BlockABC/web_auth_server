export const RandomCharset = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

export const CacheKeyPrefix = {
  Profile: 'profile:'
}

export enum ParamErrorCode {
  Required = 10000,
  KeyNotExist = 10001,
}

export enum ServerErrorCode {
  CacheDataCorrupted = 90000,
}
