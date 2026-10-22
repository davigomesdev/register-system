export type PaginationPresenter = {
  currentPage: number;
  perPage: number;
  lastPage: number;
  total: number;
};

export class Presenter {
  public static wrapper<T>(output: T): { data: T } {
    return {
      data: output,
    };
  }
}

export class CollectionPresenter {
  public static wrapper<T>(outputs: T[], meta: PaginationPresenter): { data: T[]; meta: PaginationPresenter } {
    return {
      data: outputs,
      meta,
    };
  }
}
