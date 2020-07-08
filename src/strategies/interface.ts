export interface IOAuthStrategy {
  validate: Function,
}

export interface IUser {
  openId: string,
  nickname: string,
  profile: any,
}
