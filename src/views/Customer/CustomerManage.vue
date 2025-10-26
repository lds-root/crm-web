<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      title="客户列表"
      :columns="columns"
      :requestApi="CustomerApi.page"
      :initParam="initParam"
      :dataCallback="dataCallback"
      :searchCol="{ xs: 2, sm: 3, md: 4, lg: 6, xl: 8 }"
    >
      <template #tableHeader="scope">
        <el-button type="primary" :icon="CirclePlus" v-hasPermi="['sys:customer:add']" @click="openDrawer('新增')">新增客户</el-button>
        <el-button type="primary" :icon="Download" v-hasPermi="['sys:customer:export']" @click="downloadFile">导出客户</el-button>
        <el-button type="primary" :icon="Delete" v-hasPermi="['sys:customer:remove']" @click="batchDeleteList(scope.selectedListIds)">批量删除</el-button>
      </template>

      <template #operation="scope">
        <el-button type="primary" link :icon="EditPen" v-hasPermi="['sys:customer:edit']" @click="openDrawer('编辑', scope.row)">编辑</el-button>
        <el-button type="danger" link :icon="Delete" v-hasPermi="['sys:customer:remove']" @click="batchDelete(scope.row.id)">删除</el-button>
        <el-button type="warning" link :icon="Share" v-hasPermi="['sys:customer:share']" @click="toPublic(scope.row.id)">转入公海</el-button>
      </template>

      <!-- 表格 header 按钮 -->
      <!-- <template #tableHeader>
        <el-button type="primary" :icon="CirclePlus" v-hasPermi="['sys:department:add']" @click="openDrawer('新增')">新增部门</el-button>
      </template> -->
      <!-- 表格操作 -->
      <!-- <template #operation="scope">
        <el-button type="primary" link :icon="EditPen" v-hasPermi="['sys:department:edit']" @click="openDrawer('编辑', scope.row)">编辑</el-button>
        <el-button type="danger" link :icon="Delete" v-hasPermi="['sys:department:remove']" @click="deleteDepartment(scope.row)">删除</el-button>
      </template> -->
    </ProTable>
    <CustomerDialog ref="dialogRef" />
  </div>
</template>
<script setup lang="ts" name="CustomerManage">
import { ref, reactive } from 'vue'
import { ColumnProps } from '@/components/ProTable/interface'
import ProTable from '@/components/ProTable/index.vue'
import { CustomerApi } from '@/api/modules/customer'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CustomerLevelList, CustomerSourceList, FollowUpStatusList, GenderList, IsKeyDecisionMakerList } from '@/configs/enum'
import { ElMessageBox } from 'element-plus'
import { useDownload } from '@/hooks/useDownload'
import { Download, CirclePlus, EditPen, Delete, Share } from '@element-plus/icons-vue'
import CustomerDialog from './compontents/CustomerDialog.vue'
import { useHandleData } from '@/hooks/useHandleData'

// 获取 ProTable 元素，调用其获取刷新数据方法（还能获取到当前查询参数，方便导出携带参数）
const proTable = ref()

// 如果表格需要初始化请求参数，直接定义传给 ProTable(之后每次请求都会自动带上该参数，此参数更改之后也会一直带上，改变此参数会自动刷新表格数据)
const initParam = reactive({})

// dataCallback 是对于返回的表格数据做处理，如果你后台返回的数据不是 datalist && total 这些字段，那么你可以在这里进行处理成这些字段
const dataCallback = (data: any) => {
  return {
    list: data.list,
    total: data.total
  }
}

// 表格配置项
const columns: ColumnProps[] = [
  {
    type: 'selection',
    fixed: 'left',
    width: 60
  },
  {
    prop: 'name',
    label: '客户名称',
    search: { el: 'input' },
    minWidth: 120
  },
  {
    prop: 'phone',
    label: '手机号',
    search: { el: 'input' },
    minWidth: 120
  },
  {
    prop: 'email',
    label: '邮箱',
    minWidth: 150
  },
  {
    prop: 'gender',
    label: '性别',
    enum: Object.values(GenderList), // 假设 GenderList 是一个数组
    minWidth: 120
  },
  {
    prop: 'isKeyDecisionMaker',
    label: '是否关键决策人',
    enum: Object.values(IsKeyDecisionMakerList),
    search: { el: 'select' },
    minWidth: 120
  },
  {
    prop: 'dealCount',
    label: '成交次数',
    minWidth: 120
  },
  {
    prop: 'level',
    label: '客户级别',
    enum: Object.values(CustomerLevelList),
    minWidth: 120
  },
  {
    prop: 'source',
    label: '客户来源',
    enum: Object.values(CustomerSourceList),
    minWidth: 120
  },
  {
    prop: 'address',
    label: '联系地址',
    minWidth: 120
  },
  {
    prop: 'followStatus',
    label: '跟进状态',
    enum: Object.values(FollowUpStatusList),
    minWidth: 120
  },
  {
    prop: 'nextFollowStatus',
    label: '下次跟进时间',
    minWidth: 120
  },
  {
    prop: 'creatorName',
    label: '创建人',
    minWidth: 120
  },
  {
    prop: 'ownerName',
    label: '当前拥有者',
    minWidth: 120
  },
  {
    prop: 'createTime',
    label: '创建时间',
    width: 200
  },
  {
    prop: 'operation',
    label: '操作',
    fixed: 'right',
    width: 330
  }
]

const downloadFile = async () => {
  // 1. 获取 ProTable 当前的查询参数。
  // 使用 ?? {} 确保如果 proTable.value?.searchParam 是 null 或 undefined，
  // 我们仍然会使用一个空对象 {} 来作为请求体。
  let searchParam = proTable.value?.searchParam ?? {}

  // 2. 再次防御性检查，如果获取到的值不是一个对象（例如，如果它返回了原始值 0），则强制使用空对象。
  if (typeof searchParam !== 'object' || Array.isArray(searchParam)) {
    searchParam = {}
  }
  // 注意：initParam ({ ispublic: 0 }) 应该已经被 ProTable 内部聚合到 searchParam 中了。
  // 如果您担心它被丢失，可以在此步骤确保它被包含：
  // searchParam = { ...searchParam, ...initParam }

  ElMessageBox.confirm('确认导出客户信息吗？', '温馨提示', { type: 'warning' }).then(() => {
    // 3. 将处理后的对象传递给 useDownload
    useDownload(CustomerApi.export, '客户信息', searchParam)
  })
}
const dialogRef = ref()
const openDrawer = (title: string, row: Partial<any> = {}) => {
  let params = {
    title,
    row: { ...row },
    isView: title === '查看',
    api: CustomerApi.saveOrEdit,
    getTableList: proTable.value.getTableList,
    maxHeight: '300px'
  }
  dialogRef.value.acceptParams(params)
}

const batchDelete = async (ids: any[]) => {
  await useHandleData(CustomerApi.remove, [ids], '删除客户成功')
  proTable.value.clearable()
  proTable.value.getTableList()
}

const batchDeleteList = async (ids: any[]) => {
  await useHandleData(CustomerApi.remove, ids, '删除客户成功')
  proTable.value.clearable()
  proTable.value.getTableList()
}

const toPublic = async (id: any) => {
  await useHandleData(CustomerApi.toPublic, { id: id }, '转入公海')
  proTable.value.clearable()
  proTable.value.getTableList()
}
</script>
