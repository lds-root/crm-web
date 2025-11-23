import http from '@/api'
import { COMMON_ADMIN_API } from '@/api/axios/servicePort'
export const OperLogApi = {
  page: (params: any) => http.post(COMMON_ADMIN_API + '/OperLog/page', params)
}
