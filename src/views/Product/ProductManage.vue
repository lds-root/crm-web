<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      title="商品管理"
      :columns="columns"
      :requestApi="ProductApi.page"
      :initParam="initParam"
      :dataCallback="dataCallback"
      :searchCol="{ xs: 2, sm: 3, md: 4, lg: 6, xl: 8 }"
    >
      <!-- 表格 header 按钮 -->
      <template #tableHeader>
        <el-button type="primary" :icon="CirclePlus" v-hasPermi="['sys:product:add']" @click="openDrawer('新增')">新增商品</el-button>
      </template>
      <!-- 表格操作 -->
      <template #operation="scope">
        <el-button type="primary" link :icon="EditPen" v-hasPermi="['sys:product:edit']" @click="openDrawer('编辑', scope.row)">编辑</el-button>
        <el-button v-if="scope.row.status == 2" type="primary" link :icon="EditPen" v-hasPermi="['sys:product:up']" @click="openStatusDialog('商品上架', scope.row)"
          >上架</el-button
        >
        <el-button v-if="scope.row.status == 1" type="primary" link :icon="EditPen" v-hasPermi="['sys:product:down']" @click="openStatusDialog('商品下架', scope.row)"
          >下架</el-button
        >
      </template>
    </ProTable>
    <ProductDialog ref="dialogRef" />
    <ProductStateDialog ref="statusDialog" />
  </div>
</template>
<script setup lang="ts" name="productManage">
import { ProductApi } from '@/api/modules/product'
import ProTable from '@/components/ProTable/index.vue'
import { ColumnProps } from '@/components/ProTable/interface'
import { ref, reactive } from 'vue'
import { ProductStatusList } from '@/configs/enum'
import { CirclePlus, EditPen } from '@element-plus/icons-vue'
import ProductDialog from '@/views/Product/component/ProductDialog.vue'
import ProductStateDialog from '@/views/Product/component/ProductStateDialog.vue'

const proTable = ref()

const initParam = reactive({})

const dataCallback = (data: any) => {
  return {
    list: data.list,
    total: data.total
  }
}

const dialogRef = ref()
const openDrawer = (title: string, row: Partial<any> = {}) => {
  let params = {
    title,
    row: { ...row },
    isView: title === '查看',
    api: ProductApi.saveOrEdit,
    getTableList: proTable.value.getTableList,
    maxHeight: '300px'
  }
  dialogRef.value.acceptParams(params)
}

const statusDialog = ref()
const openStatusDialog = (title: string, row: Partial<any> = {}) => {
  let params = {
    title,
    row: { ...row },
    isView: title === '查看',
    api: ProductApi.changeStatus,
    getTableList: proTable.value.getTableList,
    maxHeight: '150px'
  }
  statusDialog.value.acceptParams(params)
}

const columns: ColumnProps[] = [
  {
    type: 'selection',
    fixed: 'left',
    width: 60
  },
  {
    prop: 'name',
    label: '商品名称',
    minWidth: 120,
    search: { el: 'input' }
  },
  {
    prop: 'price',
    label: '价格',
    minWidth: 120
  },
  {
    prop: 'sales',
    label: '销量',
    minWidth: 120
  },
  {
    prop: 'stock',
    label: '库存数量',
    minWidth: 120
  },
  {
    prop: 'status',
    label: '状态',
    minWidth: 120,
    enum: Object.values(ProductStatusList),
    search: { el: 'select' }
  },
  { prop: 'operation', label: '操作', fixed: 'right', width: 230 }
]
</script>
