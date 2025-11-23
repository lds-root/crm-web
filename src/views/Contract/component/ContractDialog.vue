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
        :model="dialogProps.row"
        :disabled="dialogProps.isView"
        :hide-required-asterisk="dialogProps.isView"
      >
        <el-form-item label="合同编号" prop="number" v-if="dialogProps.row!.id">
          <el-input v-model="dialogProps.row!.number" readonly="true" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="合同名称" prop="name">
          <el-input v-model="dialogProps.row!.name" clearable maxlength="100" show-word-limit></el-input>
        </el-form-item>

        <el-form-item label="签约客户" prop="customerId">
          <div class="flex" style="width: 100%">
            <el-input v-model="dialogProps.row!.customerName" placeholder="请选择要签约的客户" class="mr-18px" disabled> </el-input>
            <el-button type="primary" @click="openCustomerDialog('选择客户')">客户信息</el-button>
          </div>
        </el-form-item>

        <el-form-item label="合同商品" prop="contractProducts">
          <div class="flex" style="width: 100%; align-items: flex-start; flex-direction: column">
            <el-button type="primary" @click="openProductDialog('选择商品')" style="margin-bottom: 10px">选择商品</el-button>
            <div v-if="dialogProps.row!.contractProducts && dialogProps.row!.contractProducts.length > 0">
              <el-tag
                v-for="item in dialogProps.row!.contractProducts"
                :key="item.id"
                class="mx-1"
                closable
                @close="removeProduct(item.id)"
                style="margin-right: 8px; margin-bottom: 4px"
              >
                {{ item.name }} (￥{{ item.price }})
              </el-tag>
              <p style="margin-top: 10px; color: #409eff">已选 {{ dialogProps.row!.contractProducts.length }} 件商品</p>
            </div>
            <p v-else style="color: #999">请点击按钮选择合同商品</p>
          </div>
        </el-form-item>

        <div class="flex" style="width: 100%">
          <el-form-item label="合同开始时间" prop="startTime">
            <el-date-picker
              v-model="dialogProps.row!.startTime"
              type="date"
              placeholder="选择合同开始时间"
              value-format="YYYY-MM-DD"
              :disabled-date="(time) => time.getTime() < Date.now() - 8.64e7"
            />
          </el-form-item>
          <el-form-item label="合同结束时间" prop="endTime">
            <el-date-picker
              v-model="dialogProps.row!.endTime"
              type="date"
              placeholder="选择合同结束时间"
              value-format="YYYY-MM-DD"
              :disabled-date="(time) => time.getTime() < Date.now() - 8.64e7"
            />
          </el-form-item>
          <el-form-item label="合同签约时间" prop="signTime">
            <el-date-picker
              v-model="dialogProps.row!.signTime"
              type="date"
              placeholder="选择合同签约时间"
              value-format="YYYY-MM-DD"
              :disabled-date="(time) => time.getTime() < Date.now() - 8.64e7"
            />
          </el-form-item>
        </div>

        <div class="flex" style="width: 100%">
          <el-form-item label="合同总金额" prop="amount" style="flex: 1">
            <el-input v-model="dialogProps.row!.amount" clearable type="number" step="0.01"></el-input>
          </el-form-item>
          <el-form-item label="已收款项" prop="receivedAmount" style="flex: 1">
            <el-input v-model="dialogProps.row!.receivedAmount" clearable type="number" step="0.01"></el-input>
          </el-form-item>
        </div>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="dialogProps.row!.remark" clearable type="textarea" maxlength="100" show-word-limit></el-input>
        </el-form-item>
      </el-form>
    </div>

    <CustomerDialog ref="customerRef" @get-customer-data="getCustomerData" />
    <ProductDialog ref="productRef" @get-products-data="getProductsData" />

    <template #footer>
      <slot name="footer">
        <el-button @click="cancelDialog">取消</el-button>
        <el-button type="primary" v-show="!dialogProps.isView" @click="handleSubmit">确定</el-button>
      </slot>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, FormRules } from 'vue'
import { ElMessage, FormInstance } from 'element-plus'
import { Dialog } from '@/components/Dialog'
// 假设 CustomerApi 存在于此路径
import { CustomerApi } from '@/api/modules/contract'
import CustomerDialog from './CustomerDialog.vue'
// 🚨 新增：导入 ProductDialog
import ProductDialog from './ProductDialog.vue'
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
const dialogVisible = ref(false)
const dialogProps = ref<DialogProps>({
  isView: false,
  title: '',
  row: {},
  labelWidth: 120,
  fullscreen: true,
  maxHeight: '500px'
})

// 接收父组件传过来的参数
const acceptParams = (params: DialogProps): void => {
  // 初始化 contractProducts 数组，确保在新增时不会丢失
  if (!params.row.contractProducts) {
    params.row.contractProducts = []
  }
  params.row = { ...dialogProps.value.row, ...params.row }
  dialogProps.value = { ...dialogProps.value, ...params }
  dialogVisible.value = true
}

defineExpose({
  acceptParams
})

// 校验规则 (保持不变，已包含上次的修正)
const rules: FormRules = {
  name: [{ required: true, message: '请输入合同名称', trigger: 'blur' }],
  // 校验 customerId
  customerId: [{ required: true, message: '请选择签约客户', trigger: 'change' }],
  // contractProducts: [{ required: true, message: '请选择合同商品', trigger: 'change' }], // 🚨 可选：如果商品是必填
  startTime: [{ required: true, message: '合同开始时间不能为空', trigger: 'change' }],
  endTime: [{ required: true, message: '合同结束时间不能为空', trigger: 'change' }],
  signTime: [{ required: true, message: '合同签约时间不能为空', trigger: 'change' }]
}

const ruleFormRef = ref<FormInstance>()
const customerRef = ref()
// 🚨 新增：商品选择弹窗引用
const productRef = ref()

// 开启客户选择弹窗 (保持不变)
const openCustomerDialog = (title: string, row: Partial<any> = {}) => {
  let params = {
    title,
    row: { ...row },
    isView: title === '查看',
    api: CustomerApi.page,
    getTableList: () => {},
    maxHeight: '300px'
  }
  customerRef.value.acceptParams(params)
}

// 接收 CustomerDialog 传回的选中客户信息 (保持不变)
const getCustomerData = (customer: { customerId: number; customerName: string }) => {
  dialogProps.value.row!.customerId = customer.customerId
  dialogProps.value.row!.customerName = customer.customerName
  if (ruleFormRef.value) {
    ruleFormRef.value.validateField('customerId')
  }
}

// 🚨 新增：开启商品选择弹窗
const openProductDialog = (title: string) => {
  // 传递当前已选中的商品列表，在弹窗中默认勾选
  const selectedProducts = dialogProps.value.row!.contractProducts || []
  let params = {
    title,
    row: { selectedProducts },
    isView: title === '查看',
    maxHeight: '300px'
  }
  productRef.value.acceptParams(params)
}

// 🚨 新增：接收 ProductDialog 传回的选中商品信息
const getProductsData = (products: any[]) => {
  dialogProps.value.row!.contractProducts = products

  // 简单计算合同总金额 (可选，但推荐)
  const totalAmount = products.reduce((sum, item) => sum + (item.price || 0), 0)
  dialogProps.value.row!.amount = totalAmount
}

// 🚨 新增：移除已选商品
const removeProduct = (id: number) => {
  dialogProps.value.row!.contractProducts = dialogProps.value.row!.contractProducts.filter((p: any) => p.id !== id)

  // 重新计算合同总金额
  const totalAmount = dialogProps.value.row!.contractProducts.reduce((sum: number, item: any) => sum + (item.price || 0), 0)
  dialogProps.value.row!.amount = totalAmount
}

// 提交合同 (保持不变)
const handleSubmit = () => {
  ruleFormRef.value!.validate(async (valid) => {
    if (!valid) return
    try {
      // 提交时，contractProducts 数组会随 row 一起提交到后端
      delete dialogProps.value.row['updateTime']
      delete dialogProps.value.row['createTime']
      await dialogProps.value.api!(dialogProps.value.row)
      ElMessage.success({ message: `${dialogProps.value.title}成功！` })
      dialogProps.value.getTableList!()
      dialogVisible.value = false
      if (ruleFormRef.value) {
        ruleFormRef.value.resetFields()
      }
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
    if (ruleFormRef.value) {
      ruleFormRef.value.resetFields()
    }
  }
}
</script>
