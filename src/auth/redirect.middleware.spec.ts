import { RedirectMiddleware } from './redirect.middleware'

describe('RedirectMiddleware', () => {
  it('should be defined', () => {
    expect(new RedirectMiddleware()).toBeDefined()
  })
})
