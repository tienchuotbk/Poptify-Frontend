import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../../../shared/api/api-context';
import { queryKeys } from '../../../shared/api/query-keys';
import { type AppSettings, type UpdateAppSettings } from '../../../shared/types';
import { getAppSettings, updateAppSettings } from '../api/app-settings-api';

export function useAppSettings() {
  const client = useApiClient();
  return useQuery({
    queryKey: queryKeys.appSettings,
    queryFn: () => getAppSettings(client),
  });
}

export function useUpdateAppSettings() {
  const client = useApiClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateAppSettings) => updateAppSettings(client, body),
    // Optimistic: phản hồi tức thì (đặc biệt toggle appEnabled), rollback khi lỗi.
    onMutate: async (body) => {
      await qc.cancelQueries({ queryKey: queryKeys.appSettings });
      const prev = qc.getQueryData<AppSettings>(queryKeys.appSettings);
      if (prev) {
        const optimistic: AppSettings = {
          ...prev,
          appEnabled: body.appEnabled ?? prev.appEnabled,
          deviceTarget: body.deviceTarget ?? prev.deviceTarget,
          globalPageTarget: body.globalPageTarget ?? prev.globalPageTarget,
          startDate: body.schedule?.startDate ?? prev.startDate,
          endDate: body.schedule?.endDate ?? prev.endDate,
          timezone: body.schedule?.timezone ?? prev.timezone,
        };
        qc.setQueryData(queryKeys.appSettings, optimistic);
      }
      return { prev };
    },
    onError: (_err, _body, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(queryKeys.appSettings, ctx.prev);
      }
    },
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.appSettings, data);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.appSettings });
    },
  });
}
