declare module 'passport-line-auth' {
  import passport from 'passport'

  export class Strategy extends passport.Strategy {}

  export interface Profile extends passport.Profile {
    [key: string]: any,
  }
}
