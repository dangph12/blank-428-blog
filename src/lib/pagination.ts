export interface PaginationResult {
  validPage: number;
  offset: number;
  limit: number;
  totalPages: number;
}

export function getPagination(totalCount: number, postsPerPage: number, requestedPage: number): PaginationResult | null {
  const totalPages = Math.ceil((totalCount || 0) / postsPerPage);
  if (requestedPage < 1 || (totalPages > 0 && requestedPage > totalPages)) return null;
  const validPage = requestedPage;
  const offset = (validPage - 1) * postsPerPage;
  const limit = offset + postsPerPage - 1;
  return { validPage, offset, limit, totalPages };
}
