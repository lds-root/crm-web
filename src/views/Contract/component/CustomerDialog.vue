<template>
  <Dialog
    :model-value="dialogVisible"
    :title="dialogProps.title"
    :fullscreen="dialogProps.fullscreen"
    :max-height="dialogProps.maxHeight"
    :cancel-dialog="cancelDialog"
    width="70%"
    top="8=vh"
  >
    <CustomerManage :is-show-header="false" ref="customerManageRef" />
    <template #footer>
      <slot name="footer">
        <el-button @click="cancelDialog">取消</el-button>
        <el-button type="primary" @click="getCustomerData()">确定</el-button>
      </slot>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, defineExpose, defineEmits } from 'vue' // 引入 defineEmits
import { ElMessage } from 'element-plus' // 引入 ElMessage
import { Dialog } from '@/components/Dialog'
import CustomerManage from '@/views/Customer/CustomerManage.vue'

// 1. 定义事件：用于将选中的数据传回父组件 (ContractDialog)
const emit = defineEmits<{
  (e: 'getCustomerData', value: { customerId: number; customerName: string }): void
}>()

interface DialogProps {
  title: string
  isView: boolean
  fullscreen?: boolean
  row: any
  labelWidth?: number
  maxHeight?: number | string
  api?: (params: any) => Promise<any>
  getTableList?: () => Promise<any>
}

const customerManageRef = ref()

const dialogVisible = ref(false)
const dialogProps = ref<DialogProps>({
  isView: false,
  title: '',
  row: {},
  labelWidth: 160,
  fullscreen: true,
  maxHeight: '500px'
})

// 接收父组件传过来的参数
const acceptParams = (params: DialogProps): void => {
  params.row = { ...dialogProps.value.row, ...params.row }
  dialogProps.value = { ...dialogProps.value, ...params }
  dialogVisible.value = true
}

defineExpose({
  acceptParams
})

// 2. 获取选中的客户数据并触发事件
const getCustomerData = () => {
  // ⚠️ 现在 CustomerManage 组件已暴露 getSelectedRow 方法
  const selectedRow = customerManageRef.value.getSelectedRow()

  if (!selectedRow || !selectedRow.id) {
    ElMessage.warning('请先选择一个客户！')
    return
  }

  // 触发事件，将客户 ID 和名称传回父组件
  emit('getCustomerData', {
    customerId: selectedRow.id,
    customerName: selectedRow.name // 假设客户表字段名为 name
  })

  // 关闭弹窗
  cancelDialog()
}

const cancelDialog = () => {
  dialogVisible.value = false
}
</script>
