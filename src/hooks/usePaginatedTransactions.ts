import { useCallback, useState } from "react";
import {
  PaginatedRequestParams,
  PaginatedResponse,
  Transaction,
} from "../utils/types";
import { PaginatedTransactionsResult } from "./types";
import { useCustomFetch } from "./useCustomFetch";

export function usePaginatedTransactions(): PaginatedTransactionsResult {
  const { fetchWithCache, loading } = useCustomFetch();
  const [paginatedTransactions, setPaginatedTransactions] =
    useState<PaginatedResponse<Transaction[]> | null>(null);

  const fetchAll = useCallback(async () => {
    const response = await fetchWithCache<
      PaginatedResponse<Transaction[]>,
      PaginatedRequestParams
    >("paginatedTransactions", {
      page: paginatedTransactions === null ? 0 : paginatedTransactions.nextPage,
    });

    setPaginatedTransactions((previousResponse) => {
      if (response === null) {
        // Nothing left to fetch, so return the previous response
        return previousResponse;
      }

      if (previousResponse === null) {
        // This means that this is the initial load, so we return the response
        return response;
      }

      // Combine the previous transactions with the new transactions to fix Bug #4
      return {
        data: [...previousResponse.data, ...response.data],
        nextPage: response.nextPage,
      };
    });
  }, [fetchWithCache, paginatedTransactions]);

  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null);
  }, []);

  return { data: paginatedTransactions, loading, fetchAll, invalidateData };
}
