<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      title="日志管理"
      :columns="columns"
      :requestApi="LogApi.page"
      :initParam="initParam"
      :dataCallback="dataCallback"
      :searchCol="{ xs: 2, sm: 3, md: 4, lg: 6, xl: 8 }"
    >
    </ProTable>
  </div>
</template>

<script setup lang="ts" name="LogManage">
import ProTable from '@/components/ProTable/index.vue'
import { LogApi } from '@/api/modules/log'
import { reactive, ref, h } from 'vue'
import { ColumnProps } from '@/components/ProTable/interface'
import { ElTag } from 'element-plus'
const proTable = ref()
const initParam = reactive({})
const dataSize = ref(0)

const dataCallback = (data: any) => {
  dataSize.value = data.list.size
  return {
    list: data.list,
    total: data.total
  }
}

const columns: ColumnProps[] = [
  { type: 'selection', fixed: 'left', width: 60 },
  {
    prop: 'title',
    label: '模块标题',
    minWidth: 120,
    search: { el: 'input' }
  },
  {
    prop: 'operType',
    label: '业务类型',
    minWidth: 120,
    render(scope) {
      let text = scope.row.operType === 0 ? '其他' : scope.row.operType === 1 ? '查询' : scope.row.operType === 2 ? '修改' : '删除'
      let type: 'success' | 'warning' | 'danger' | 'info' =
        scope.row.operType === 0 ? 'danger' : scope.row.operType === 1 ? 'success' : scope.row.operType === 2 ? 'warning' : 'info'
      return h(ElTag, { type }, () => text)
    }
  },
  {
    prop: 'operUrl',
    label: '请求url',
    minWidth: 200,
    search: { el: 'input' }
  },
  {
    prop: 'operIp',
    label: '主机地址',
    minWidth: 120
  },
  {
    prop: 'operLocation',
    label: '操作地点',
    minWidth: 120
  },
  {
    prop: 'operName',
    label: '操作人员',
    minWidth: 120,
    search: { el: 'input' }
  },
  {
    prop: 'status',
    label: '操作状态',
    minWidth: 120,
    render(scope) {
      const text = scope.row.status === 1 ? '失败' : '成功'
      const type = scope.row.status === 1 ? 'danger' : 'success'
      return h(ElTag, { type }, () => text)
    }
  },
  {
    prop: 'requestMethod',
    label: '请求方法',
    minWidth: 120
  },
  {
    prop: 'errorMsg',
    label: '错误消息',
    minWidth: 260
  },
  {
    prop: 'costTime',
    label: '消耗时间',
    minWidth: 120
  },
  {
    prop: 'jsonResult',
    label: '返回参数',
    minWidth: 120
  },
  {
    prop: 'method',
    label: '方法名称',
    minWidth: 120
  },
  {
    prop: 'operParam',
    label: '请求参数',
    minWidth: 200
  },
  {
    prop: 'operTime',
    label: '操作时间',
    width: '200px',
    search: { el: 'date-picker', props: { type: 'datetimerange' }, span: 3 }
  }
]
</script>
