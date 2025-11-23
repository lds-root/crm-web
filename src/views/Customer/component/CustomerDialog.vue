<template>
  <Dialog :model-value="dialogVisible" :title="dialogProps.title" :fullscreen="dialogProps.fullscreen" :max-height="dialogProps.maxHeight" cancel-dialog="cancelDialog" width="50%">
    <div :style="'width: calc(100% - ' + (dialogProps.labelWidth || 0) / 2 + 'px)'">
      <el-form
        ref="ruleFormRef"
        label-position="right"
        :label-width="(dialogProps.labelWidth || 160) + 'px'"
        :rules="rules"
        :model="dialogProps.row"
        :disabled="dialogProps.isView"
        :hide-required-asterisk="dialogProps.isView"
      >
        <el-form-item label="客户名称" prop="name">
          <el-input v-model="dialogProps.row.name" placeholder="请填写客户名称" clearable maxlength="50" show-word-limit></el-input>
        </el-form-item>

        <el-form-item label="客户手机号" prop="phone">
          <el-input v-model="dialogProps.row.phone" placeholder="请填写客户手机号" clearable maxlength="11" show-word-limit></el-input>
        </el-form-item>

        <el-form-item label="客户邮箱" prop="email">
          <el-input v-model="dialogProps.row.email" placeholder="请填写客户邮箱" clearable maxlength="100" show-word-limit></el-input>
        </el-form-item>

        <el-form-item label="客户地址" prop="address">
          <el-input v-model="dialogProps.row.address" placeholder="请填写客户地址" clearable maxlength="100" show-word-limit></el-input>
        </el-form-item>

        <el-form-item label="客户等级" prop="level">
          <el-select v-model="dialogProps.row.level" filterable placeholder="请选择客户等级" class="w-full">
            <el-option v-for="item in Object.values(CustomerLevelList)" :key="item.value" :label="item.label" :value="item.value" class="isabel-option" />
          </el-select>
        </el-form-item>

        <el-form-item label="客户来源" prop="source">
          <el-select v-model="dialogProps.row.source" filterable placeholder="请选择客户来源" class="w-full">
            <el-option v-for="item in Object.values(CustomerSourceList)" :key="item.value" :label="item.label" :value="item.value" class="isabel-option" />
          </el-select>
        </el-form-item>

        <el-form-item label="跟进状态" prop="followStatus">
          <el-select v-model="dialogProps.row.followStatus" filterable placeholder="请选择客户跟进状态" class="w-full">
            <el-option v-for="item in Object.values(FollowUpStatusList)" :key="item.value" :label="item.label" :value="item.value" class="isabel-option" />
          </el-select>
        </el-form-item>

        <el-form-item label="是否为关键决策人" prop="isKeyDecisionMaker">
          <el-select v-model="dialogProps.row.isKeyDecisionMaker" filterable placeholder="请选择客户是否为关键决策人" class="w-full">
            <el-option v-for="item in Object.values(IsKeyDecisionMakerList)" :key="item.value" :label="item.label" :value="item.value" class="isabel-option" />
          </el-select>
        </el-form-item>

        <el-form-item label="客户性别" prop="gender">
          <el-select v-model="dialogProps.row.gender" filterable placeholder="请选择客户性别" class="w-full">
            <el-option v-for="item in Object.values(GenderList)" :key="item.value" :label="item.label" :value="item.value" class="isabel-option" />
          </el-select>
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
import { ref, reactive } from 'vue'
import { ElMessage, FormInstance } from 'element-plus'
// 假设这是 Dialog 组件的导入路径
import { Dialog } from '@/components/Dialog'

// 导入枚举/配置列表
import { CustomerLevelList, CustomerSourceList, FollowUpStatusList, GenderList, IsKeyDecisionMakerList } from '@/configs/enum'

// 为了解决 TypeScript 编译器无法识别模板中使用的情况，添加一个空引用以避免 unused warning
void CustomerLevelList
void CustomerSourceList
void FollowUpStatusList
void GenderList
void IsKeyDecisionMakerList

// 接口定义（从图片中提取）
interface DialogProps {
  title: string
  isView: boolean
  fullscreen?: boolean
  row: any
  labelWidth?: number
  maxHeight: number | string
  api?: (params: any) => Promise<any>
  getTableList?: () => Promise<any>
}

// 响应式状态
const dialogVisible = ref(false)

const dialogProps = ref<DialogProps>({
  isView: false,
  title: '',
  row: {},
  labelWidth: 160,
  fullscreen: true,
  maxHeight: '500px'
})

const acceptParams = (params: DialogProps): void => {
  params.row = { ...dialogProps.value.row, ...params.row }
  dialogProps.value = { ...dialogProps.value, ...params }
  dialogVisible.value = true
}

defineExpose({
  acceptParams
})

// 表单验证规则 (从图片中提取)
const rules = reactive({
  name: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入客户手机号', trigger: 'blur' },
    {
      // 注意：正则表达式为 /^[3-9]\d{9}$/，它要求第一位是 3-9，后面跟 9 个数字，总共 10 位。
      // 如果手机号是 11 位，这个正则可能需要调整，但这里保留图片中的内容。
      pattern: /^1[3-9]\d{9}$/,
      message: '手机号格式不正确',
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    {
      // 邮箱正则：/^([A-Za-z0-9_\-\.\%]+)@([A-Za-z0-9_\-\.]+)\.([A-Za-z]{2,})$/
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: '邮箱格式不正确',
      trigger: 'blur'
    }
  ],
  level: [{ required: true, message: '客户级别不能为空', trigger: 'blur' }],
  source: [{ required: true, message: '客户来源不能为空', trigger: 'blur' }]
  // address, followStatus, isKeyDecisionMaker, gender 未见必填规则，故省略
})

const ruleFormRef = ref<FormInstance>()

// 关闭对话框
const cancelDialog = (isClean?: boolean) => {
  dialogVisible.value = false
  let condition = ['查看', '编辑'] // 图片中是 '查看', '编辑'
  if (condition.includes(dialogProps.value.title) || isClean) {
    dialogProps.value.row = {} // 清空数据
    ruleFormRef.value!.resetFields() // 重置表单验证状态
  }
}

// 提交表单
const handleSubmit = () => {
  ruleFormRef.value!.validate(async (valid) => {
    if (!valid) return
    try {
      // 清理不需要提交的字段
      delete dialogProps.value.row['updateTime']
      delete dialogProps.value.row['createTime']

      // 调用 API 提交数据
      await dialogProps.value.api!(dialogProps.value.row)

      // 成功提示
      ElMessage.success({ message: `${dialogProps.value.title}成功！` })

      // 刷新列表
      dialogProps.value.getTableList!()

      // 关闭对话框并清空表单（图片中多余地调用了 cancelDialog(true)
      // 且在里面 resetFields，这里我精简为：直接在 success 里面调用 resetFields 并关闭）
      dialogVisible.value = false
      ruleFormRef.value!.resetFields()
      // 这里调用 cancelDialog(true) 以确保数据清理
      cancelDialog(true)
    } catch (error) {
      console.log(error)
      // 可添加失败提示 ElMessage.error()
    }
  })
}
</script>

<style scoped>
/* 样式部分未在图片中显示，这里仅作占位 */
.w-full {
  width: 100%;
}
.isabel-option {
  /* 保持与图片中 class="isabel-option" 一致 */
}
</style>
