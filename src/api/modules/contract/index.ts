import http from '@/api'
import { COMMON_ADMIN_API } from '@/api/axios/servicePort'
export const ContractsApi = {
  page: (params: any) => http.post(COMMON_ADMIN_API + '/contract/page', params),
  saveOrUpdate: (params: any) => http.post(COMMON_ADMIN_API + '/contract/saveOrUpdate', params)
}

export const CustomerApi = {
  page: (params: any) => http.post(COMMON_ADMIN_API + '/customer/page', params)
}

export const ProductApi = {
  page: (params: any) => http.post(COMMON_ADMIN_API + '/product/page', params)
}
