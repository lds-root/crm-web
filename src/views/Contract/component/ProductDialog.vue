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
    <ProductManage :is-show-header="false" ref="productManageRef" />

    <template #footer>
      <slot name="footer">
        <el-button @click="cancelDialog">取消</el-button>
        <el-button type="primary" @click="getProductsData()">确定</el-button>
      </slot>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, defineExpose, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'
import { Dialog } from '@/components/Dialog'
// 引入 ProductManage 组件
import ProductManage from '@/views/Product/ProductManage.vue'

// 定义事件：用于将选中的商品数据列表传回父组件 (ContractDialog)
const emit = defineEmits<{
  (e: 'getProductsData', value: any[]): void
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

const productManageRef = ref()

const dialogVisible = ref(false)
const dialogProps = ref<DialogProps>({
  isView: false,
  title: '选择商品',
  row: {},
  labelWidth: 160,
  fullscreen: true,
  maxHeight: '500px'
})

// 接收父组件传过来的参数
const acceptParams = (params: DialogProps): void => {
  dialogProps.value = { ...dialogProps.value, ...params }
  dialogVisible.value = true
}

defineExpose({
  acceptParams
})

// 获取选中的商品数据列表并触发事件
const getProductsData = () => {
  // 🚨 调用 ProductManage 中暴露的 getSelectedList 方法
  const selectedList = productManageRef.value.getSelectedList()

  if (!selectedList || selectedList.length === 0) {
    ElMessage.warning('请至少选择一个商品！')
    return
  }

  // 触发事件，将商品列表传回父组件
  emit('getProductsData', selectedList)

  // 关闭弹窗
  cancelDialog()
}

const cancelDialog = () => {
  dialogVisible.value = false
}
</script>
