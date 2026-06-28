import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from './api-context';

export interface WidgetQueryKeys {
  all: readonly unknown[];
  detail: (id: number) => readonly unknown[];
}

interface WidgetEntity {
  id: number;
  enabled: boolean;
}

/**
 * Factory hooks CRUD dùng chung cho popups / announcement-bars / product-sliders
 * (3 widget đồng dạng). Toggle `enabled` optimistic + rollback; create/update/delete invalidate.
 */
export function createWidgetHooks<TEntity extends WidgetEntity, TCreate, TUpdate>(
  basePath: string,
  keys: WidgetQueryKeys,
) {
  function useList() {
    const client = useApiClient();
    return useQuery({ queryKey: keys.all, queryFn: () => client.get<TEntity[]>(basePath) });
  }

  function useDetail(id: number, enabled = true) {
    const client = useApiClient();
    return useQuery({
      queryKey: keys.detail(id),
      queryFn: () => client.get<TEntity>(`${basePath}/${id}`),
      enabled: enabled && Number.isFinite(id),
    });
  }

  function useCreate() {
    const client = useApiClient();
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (body: TCreate) => client.post<TEntity>(basePath, body),
      onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
  }

  function useUpdate() {
    const client = useApiClient();
    const qc = useQueryClient();
    return useMutation({
      mutationFn: ({ id, body }: { id: number; body: TUpdate }) =>
        client.patch<TEntity>(`${basePath}/${id}`, body),
      onSuccess: (data) => {
        void qc.invalidateQueries({ queryKey: keys.all });
        qc.setQueryData(keys.detail(data.id), data);
      },
    });
  }

  function useDelete() {
    const client = useApiClient();
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (id: number) => client.del(`${basePath}/${id}`),
      onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
  }

  function useToggleEnabled() {
    const client = useApiClient();
    const qc = useQueryClient();
    return useMutation({
      mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
        client.patch<TEntity>(`${basePath}/${id}`, { enabled } as unknown as TUpdate),
      onMutate: async ({ id, enabled }) => {
        await qc.cancelQueries({ queryKey: keys.all });
        const prev = qc.getQueryData<TEntity[]>(keys.all);
        if (prev) {
          qc.setQueryData<TEntity[]>(
            keys.all,
            prev.map((e) => (e.id === id ? { ...e, enabled } : e)),
          );
        }
        return { prev };
      },
      onError: (_err, _vars, ctx) => {
        if (ctx?.prev) qc.setQueryData(keys.all, ctx.prev);
      },
      onSettled: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
  }

  return { useList, useDetail, useCreate, useUpdate, useDelete, useToggleEnabled };
}
