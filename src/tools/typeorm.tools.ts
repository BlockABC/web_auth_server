// todo: 这个用 interceptors 来实现，可能更为简单
/**
 * 根据 typeorm 的 findAndCount 的返回值和 findOptions，生成返回值
 * @param list
 * @param total
 * @param findOptions
 */
export function buildReturnListWithPagination ([list, total], findOptions) {
  return {
    list,
    pagination: {
      skip: findOptions.skip,
      limit: findOptions.take,
      total
    }
  }
}
