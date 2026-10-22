export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export type SearchInput<S extends string, F, O> = {
  readonly page?: number | undefined;
  readonly perPage?: number | undefined;
  readonly sort?: S | undefined;
  readonly sortDir?: SortDirection | undefined;
  readonly filter: F;
  readonly options: O;
};

export class SearchParams<S extends string, F, O> {
  public readonly page: number;
  public readonly perPage: number;
  public readonly sort: S;
  public readonly sortDir: SortDirection;
  public readonly filter: F;
  public readonly options: O;

  public constructor(input: SearchInput<S, F, O>, defaultSort: S) {
    this.page = Math.max(input.page ?? 1, 1);
    this.perPage = Math.max(input.perPage ?? 15, 1);
    this.sort = input.sort ?? defaultSort;
    this.sortDir = input.sortDir ?? SortDirection.Desc;
    this.filter = input.filter;
    this.options = input.options;
  }

  public offset(): number {
    return (this.page - 1) * this.perPage;
  }
}

export class SearchResult<E> {
  public readonly items: E[];
  public readonly total: number;
  public readonly page: number;
  public readonly perPage: number;

  public constructor(items: E[], total: number, params: SearchParams<string, unknown, unknown>) {
    this.items = items;
    this.total = total;
    this.page = params.page;
    this.perPage = params.perPage;
  }

  public lastPage(): number {
    return Math.max(Math.ceil(this.total / this.perPage), 1);
  }
}
