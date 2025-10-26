<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      title="公海管理"
      :columns="columns"
      :requestApi="CustomerApi.page"
      :initParam="initParam"
      :dataCallback="dataCallback"
      :searchCol="{ xs: 2, sm: 3, md: 4, lg: 6, xl: 8 }"
    >
      <template #operation="scope">
        <el-button type="primary" link :icon="EditPen" v-hasPermi="['sys:customer:private']" @click="customerToPrivate(scope.row.id)">客户领取</el-button>
      </template>
    </ProTable>
  </div>
</template>
<script setup lang="ts" name="PublicManager">
import ProTable from '@/components/ProTable/index.vue'
import { CustomerApi } from '@/api/modules/customer'
import { ref, reactive } from 'vue'
import { ColumnProps } from '@/components/ProTable/interface'
import { GenderList, IsKeyDecisionMakerList } from '@/configs/enum'
import { useHandleData } from '@/hooks/useHandleData'

const proTable = ref()

const initParam = reactive({
  isPublic: 1
})

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
    prop: 'name',
    label: '客户姓名',
    minWidth: 120,
    search: { el: 'input' }
  },
  {
    prop: 'phone',
    label: '手机号',
    minWidth: 160,
    search: { el: 'input' }
  },
  {
    prop: 'email',
    label: '邮箱',
    minWidth: 120
  },
  {
    prop: 'gender',
    label: '性别',
    enum: Object.values(GenderList),
    minWidth: 120
  },
  {
    prop: 'isKeyDecisionMaker',
    label: '是否为关键决策人',
    enum: Object.values(IsKeyDecisionMakerList),
    minWidth: 140
  },
  { prop: 'operation', label: '操作', width: 130, fixed: 'right' }
]

const customerToPrivate = async (id: any) => {
  await useHandleData(CustomerApi.toPrivate, { id: id }, '客户领取成功')
  proTable.value.clearable()
  proTable.value.getTableList()
}
</script>
