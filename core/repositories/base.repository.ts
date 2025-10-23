// This is the shape of the paginated response, containing both the data and total count.
export type PaginatedResponse<T> = {
  data: T[];
  total: number;
};

// This generic type defines the expected shape of the Prisma client model passed to the repository.
// It ensures that the model has the necessary methods like findMany and count.
// The Prisma model type is now generic
type PrismaModel<T, W> = {
  findMany: (args: { where?: W; skip?: number; take?: number; orderBy?: any }) => Promise<T[]>;
  create: (args: any) => Promise<T>;
  update: (args: any) => Promise<T>;
  delete: (args: any) => Promise<T>;
  findUnique: (args: any) => Promise<T | null>;
  findFirst(args: { where: W }): Promise<T | null>;
  count: (args: { where?: W }) => Promise<number>;
  createMany: (args: { data: any[]; skipDuplicates?: boolean }) => Promise<{ count: number }>;

};

// The BaseRepository is a generic class that can be used for any Prisma model.
// It requires two type arguments: T for the model itself, and WhereInput for its filter type.
export class BaseRepository<T, WhereInput> {
  protected model: PrismaModel<T, WhereInput>;

  constructor(model: PrismaModel<T, WhereInput>) {
    this.model = model;
  }

  // Creates a new record in the database.
  async create(data: any): Promise<T> {
    return this.model.create({ data });
  }

    /**
   * Bulk create records.
   * @param data - Array of objects to insert.
   * @param skipDuplicates - Optional: true to avoid duplicate constraint errors.
   * @returns { count } object with number of records created.
   */
  async createMany(data: any[], skipDuplicates: boolean = false): Promise<{ count: number }> {
    return this.model.createMany({ data, skipDuplicates });
  }

  // Finds a single record by its unique identifier (assuming 'id' is a string).
  async findById(id: number): Promise<T | null> {
    return this.model.findUnique({ where: { id } });
  }

  // Updates a record by its unique identifier.
  async updateById(id: number, data: any): Promise<T> {
    return this.model.update({ where: { id }, data });
  }

  // Deletes a record by its unique identifier.
  async deleteById(id: number): Promise<void> {
    await this.model.delete({ where: { id } });
  }

  /**
   * Fetches records with optional filtering, pagination, and sorting.
   * This method is a single, unified function for all fetching operations.
   * * @param where - An object containing filtering conditions.
   * @param page - Optional page number for pagination (1-based).
   * @param pageSize - Optional number of items per page.
   * @param opts - Other options like skip, take, and orderBy.
   * @returns A promise that resolves to a PaginatedResponse object containing the data and total count.
   */
  async getAll(
    where?: WhereInput,
    page?: number,
    pageSize?: number,
    opts?: { orderBy?: any; include?: any; select?: any; }
  ): Promise<PaginatedResponse<T>> {
    let skip: number | undefined;
    let take: number | undefined;

    // Determine the skip and take values based on whether a page and pageSize are provided.
    if (page !== undefined && pageSize !== undefined) {
      skip = (page - 1) * pageSize;
      take = pageSize;
    }

    // Execute both the findMany and count queries concurrently for efficiency.
    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take,
        ...opts,
      }),
      this.model.count({ where }),
    ]);

    // Return the data and total count in a single object.
    return {
      data,
      total,
    };
  }

  // Counts records based on a filter. This is a helper method used internally by getAll.
  async count(where?: WhereInput): Promise<number> {
    return this.model.count({ where });
  }
}