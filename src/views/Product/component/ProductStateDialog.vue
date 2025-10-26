<template>
  <Dialog
    :model-value="dialogVisible"
    :title="dialogProps.title"
    :fullscreen="dialogProps.fullscreen"
    :max-height="dialogProps.maxHeight"
    :cancel-dialog="cancelDialog"
    width="50%"
  >
    <div :style="'width: calc(100% - ' + dialogProps.labelWidth! / 2 + 'px)'">
      <el-form
        ref="ruleFormRef"
        label-position="right"
        :label-width="dialogProps.labelWidth + 'px'"
        :rules="rules"
        :model="formModel"
        :disabled="dialogProps.isView"
        :hide-required-asterisk="dialogProps.isView"
      >
        <el-form-item :label="dialogProps.title + '时间'" prop="time">
          <el-date-picker v-model="formModel.time" type="datetime" :placeholder="`请选择${dialogProps.title}` + '时间'" value-format="YYYY-MM-DD HH:mm:ss"> </el-date-picker>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <slot name="footer">
        <el-button @click="cancelDialog">取消</el-button>
        <el-button type="primary" v-show="!dialogProps.isView" @click="handleSubmit">确定</el-button>
      </slot>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue' // 【修改点 3】: 引入 reactive
import { dayjs, ElMessage, FormInstance, FormRules } from 'element-plus' // 【修改点 4】: 引入 FormRules
import { Dialog } from '@/components/Dialog'

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

// 独立的表单数据模型
interface FormModel {
  time: string | null
}

const dialogVisible = ref(false)
const dialogProps = ref<DialogProps>({
  isView: false,
  title: '',
  row: {},
  labelWidth: 120,
  fullscreen: true,
  maxHeight: '500px'
})

// 【修改点 5】: 定义独立的表单数据模型
const formModel = reactive<FormModel>({
  time: null
})

// 接收父组件传过来的参数
const acceptParams = (params: DialogProps): void => {
  // 1. 合并 props
  dialogProps.value = { ...dialogProps.value, ...params }
  // 2. 确保 row 是一个新对象，避免直接修改父组件的原始数据
  dialogProps.value.row = { ...params.row }

  // 3. 【修改点 6】: 将正确的业务时间字段的值赋给 formModel.time
  if (dialogProps.value.title === '商品上架') {
    formModel.time = dialogProps.value.row.onShelfTime || null
  } else if (dialogProps.value.title === '商品下架') {
    formModel.time = dialogProps.value.row.offShelfTime || null
  } else {
    formModel.time = null
  }

  dialogVisible.value = true
}

defineExpose({
  acceptParams
})

const rules = computed<FormRules>(() => {
  // 【修改点 7】: 移除 eslint-disable 并使用 FormRules 类型
  const title = dialogProps.value.title
  return {
    time: [
      {
        required: true,
        message: `请选择${title}时间`,
        trigger: 'blur'
      },
      {
        validator: (rule: any, value: string | null, callback: (error?: Error) => void) => {
          if (!value) {
            return callback(new Error(`请选择${title}时间`))
          }
          const now = dayjs()
          const selected = dayjs(value)
          // 校验：不能早于当前时间（以分钟为精度）
          if (selected.isBefore(now, 'minute')) {
            return callback(new Error(`${title}时间不能早于当前时间`))
          }
          callback()
        },
        trigger: 'change'
      }
    ]
  }
})

const ruleFormRef = ref<FormInstance>()

const handleSubmit = () => {
  // 【修改点 8】: 校验 formModel
  ruleFormRef.value!.validate(async (valid) => {
    if (!valid) return
    try {
      // 1. 创建提交对象，包含原始数据
      const submitRow = { ...dialogProps.value.row }

      // 2. 【核心修改】: 将 formModel.time 的新值回填到正确的业务字段
      if (dialogProps.value.title === '商品上架') {
        submitRow.onShelfTime = formModel.time
      } else {
        submitRow.offShelfTime = formModel.time
      }

      // 3. 清除不必要的字段（如 createTime/updateTime，以及临时的 time 字段，尽管它不在 row 中了，但作为习惯）
      delete submitRow['updateTime']
      delete submitRow['createTime']

      // 4. 执行 API 调用
      await dialogProps.value.api!(submitRow) // 提交更新后的 submitRow
      console.log(submitRow)

      ElMessage.success({ message: `${dialogProps.value.title}成功！` })
      dialogProps.value.getTableList && dialogProps.value.getTableList!()

      // 5. 【修改点 9】: 成功后调用统一的清理函数
      cancelDialog(true)
    } catch (error) {
      console.log(error)
    }
  })
}
const cancelDialog = (isClean?: boolean) => {
  dialogVisible.value = false
  let condition = ['查看', '编辑']
  if (condition.includes(dialogProps.value.title) || isClean) {
    dialogProps.value.row = {}
    formModel.time = null // 【修改点 10】: 清理独立的表单模型
    ruleFormRef.value!.resetFields()
  }
}
</script>
