export interface PaginationData {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  skip: number;
  pages: number[];
}

export class PaginationUtil {
  private static readonly visiblePageCount = 5;

  static parsePage(value?: string): number {
    if (!value || !/^\d+$/.test(value)) {
      return 1;
    }

    const page = Number(value);
    return Number.isSafeInteger(page) && page > 0 ? page : 1;
  }

  static create(page: number, pageSize: number, total: number): PaginationData {
    if (!Number.isSafeInteger(page) || page < 1) {
      throw new RangeError('Page must be a positive integer.');
    }
    if (!Number.isSafeInteger(pageSize) || pageSize < 1) {
      throw new RangeError('Page size must be a positive integer.');
    }
    if (!Number.isSafeInteger(total) || total < 0) {
      throw new RangeError('Total records must be a non-negative integer.');
    }

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(page, totalPages);
    const startPage = Math.max(
      1,
      Math.min(
        currentPage - Math.floor(PaginationUtil.visiblePageCount / 2),
        totalPages - PaginationUtil.visiblePageCount + 1,
      ),
    );
    const endPage = Math.min(
      totalPages,
      startPage + PaginationUtil.visiblePageCount - 1,
    );

    return {
      page: currentPage,
      pageSize,
      total,
      totalPages,
      skip: (currentPage - 1) * pageSize,
      pages: Array.from(
        { length: endPage - startPage + 1 },
        (_, index) => startPage + index,
      ),
    };
  }

  static withData<T extends object, TExtra extends object>(
    data: T,
    extra: TExtra,
  ): T & TExtra {
    return {
      ...data,
      ...extra,
    };
  }
  
}
