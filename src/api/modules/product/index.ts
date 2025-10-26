import http from '@/api'
import { COMMON_ADMIN_API } from '@/api/axios/servicePort'
export const ProductApi = {
  page: (params: any) => http.post(COMMON_ADMIN_API + '/product/page', params),
  saveOrEdit: (param: any) => http.post(COMMON_ADMIN_API + '/product/saveOrEdit', param),
  changeStatus: (param: any) => http.post(COMMON_ADMIN_API + '/product/changeStatus', param)
}
