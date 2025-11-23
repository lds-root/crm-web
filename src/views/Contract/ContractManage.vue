<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      title="合同列表"
      :columns="columns"
      :requestApi="ContractsApi.page"
      :initParam="initParam"
      :dataCallback="dataCallback"
      :searchCol="{ xs: 2, sm: 3, md: 4, lg: 6, xl: 8 }"
      :row-key="(row) => row.id"
      @selection-change="selectionChange"
    >
      <template #tableHeader>
        <el-button type="primary" :icon="CirclePlus" v-hasPermi="['sys:contract:add']" @click="openDrawer('新增')">新增合同</el-button>

        <el-button type="primary" :icon="Document" v-hasPermi="['sys:contract:print']" @click="handlePrint" :disabled="selectedList.length === 0">
          批量打印/导出PDF (已选 {{ selectedList.length }} 项)
        </el-button>
      </template>

      <template #status="{ row }">
        <el-tag v-if="row.status === 2" type="success">审核通过</el-tag>
        <el-tag v-else-if="row.status === 3" type="danger">审核未通过</el-tag>
        <el-tag v-else-if="row.status === 1" type="warning">审核中</el-tag>
        <el-tag v-else type="info">初始化</el-tag>
      </template>

      <template #operation="scope">
        <el-button type="primary" link :icon="EditPen" v-hasPermi="['sys:contract:edit']" @click="openDrawer('编辑', scope.row)">编辑</el-button>
        <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
      </template>
    </ProTable>
    <ContractDialog ref="dialogRef" />

    <div id="print-contract-content" style="display: none"> </div>
  </div>
</template>

<script setup lang="ts" name="ContractManage">
import { ref, reactive } from 'vue'
import { ColumnProps } from '@/components/ProTable/interface'
import ProTable from '@/components/ProTable/index.vue'
import { ContractsApi } from '@/api/modules/contract'
import { CirclePlus, EditPen, View, Document } from '@element-plus/icons-vue'
import ContractDialog from '@/views/Contract/component/ContractDialog.vue'
import { ElMessage } from 'element-plus'
import printJS from 'print-js'

const proTable = ref()
const initParam = reactive({})
const dialogRef = ref()
const selectedList = ref<any[]>([])

const selectionChange = (selection: any[]) => {
  selectedList.value = selection
}

const dataCallback = (data: any) => {
  return { list: data.list, total: data.total }
}

const columns: ColumnProps[] = [
  { type: 'selection', fixed: 'left', width: 50 },
  { prop: 'id', label: 'ID', width: 80, search: false },
  { prop: 'number', label: '合同编号', search: { el: 'input' }, width: 150 },
  { prop: 'name', label: '合同名称', search: { el: 'input' }, width: 200 },
  { prop: 'amount', label: '合同金额 (元)', sortable: true, width: 150 },
  { prop: 'receivedAmount', label: '已回款金额 (元)', width: 150 },
  { prop: 'customerName', label: '客户名称', search: { el: 'input' }, width: 150 },
  { prop: 'signTime', label: '签约时间', width: 180, sortable: true },
  {
    prop: 'status',
    label: '合同状态',
    enum: [
      { value: 0, label: '初始化' },
      { value: 1, label: '审核中' },
      { value: 2, label: '审核通过' },
      { value: 3, label: '审核未通过' }
    ],
    search: { el: 'select' },
    width: 120,
    render: () => ({ tag: 'status' })
  },
  { prop: 'ownerName', label: '签约人', search: { el: 'input' }, width: 120 },
  {
    prop: 'startAndEndTime',
    label: '合同有效期',
    width: 220,
    search: { el: 'datetimerange', prop: ['startTime', 'endTime'] },
    formatter: (row: any) => {
      return `${row.startTime || '-'} 至 ${row.endTime || '-'}`
    }
  },
  { prop: 'operation', label: '操作', fixed: 'right', width: 180 }
]

const openDrawer = (title: string, row: Partial<any> = {}) => {
  let params = {
    title,
    row: { ...row },
    isView: title === '查看',
    api: ContractsApi.saveOrUpdate,
    getTableList: proTable.value.getTableList,
    maxHeight: '300px'
  }
  dialogRef.value.acceptParams(params)
}

/**
 * 核心打印逻辑：支持批量打印/导出选中数据
 */
const handlePrint = () => {
  const contractsToPrint = selectedList.value

  if (contractsToPrint.length === 0) {
    ElMessage.warning('请至少选择一份合同进行打印！')
    return
  }

  ElMessage.info(`正在准备 ${contractsToPrint.length} 份合同的打印内容...`)

  // 调试信息：打印最终的数据结构，用于确认
  console.log('正在打印的合同数据详情:', JSON.parse(JSON.stringify(contractsToPrint)))

  let combinedHtml = ''

  // 1. 样式只定义一次
  const globalStyle = `
    <style>
      /* 确保中文显示正常 */
      .print-page-content {
        font-family: SimHei, 'Microsoft YaHei', sans-serif;
        font-size: 10pt;
        line-height: 1.6;
        padding: 20px;
        box-sizing: border-box; /* 避免 padding 导致内容溢出 */
      }
      .contract-title { text-align: center; font-size: 20px; margin-bottom: 25px; font-weight: bold; }
      .info-item { margin-bottom: 8px; }
      .info-item strong { display: inline-block; width: 120px; text-align: right; margin-right: 10px; font-weight: normal; color: #606266; }
      .info-section { margin-top: 20px; border: 1px solid #ccc; padding: 15px; }
      .table-products { width: 100%; border-collapse: collapse; margin-top: 15px; }
      .table-products th, .table-products td { border: 1px solid #ddd; padding: 10px; text-align: left; }
      .total-amount { font-size: 16px; font-weight: bold; color: #F56C6C; margin-top: 15px; text-align: right; }
      .signature-area { margin-top: 80px; display: flex; justify-content: space-between; }
      /* 关键：确保换页符生效 */
      @media print {
          .page-break { page-break-after: always; }
      }
  `

  // 2. 循环生成并合并每份合同的 HTML
  contractsToPrint.forEach((contract, index) => {
    // console.log(contract)
    const contractHtml = generateContractBodyHtml(contract)
    combinedHtml += contractHtml

    // 插入换页符，确保每份合同单独一页
    if (index < contractsToPrint.length - 1) {
      combinedHtml += '<div class="page-break"></div>'
    }
  })

  // 3. 插入隐藏 DOM 并调用 Print.js
  const printContent = document.getElementById('print-contract-content')
  printContent.style.display = 'block'
  if (printContent) {
    printContent.innerHTML = combinedHtml
    // console.log(printContent.innerHTML)

    // 调试步骤 1: 打印最终的 HTML 内容。
    console.log('Final HTML content for Print.js:', combinedHtml)

    try {
      printJS({
        printable: 'print-contract-content',
        type: 'html',
        documentTitle: `批量合同导出_${new Date().getTime()}`,
        showModal: true,
        style: globalStyle,
        onPrintDialogClose() {
          printContent.style.display = 'none'
        }
      })
      ElMessage.success('已打开打印窗口，请在目标打印机中选择“另存为PDF”进行批量导出。')
    } catch (e) {
      ElMessage.error('打印功能调用失败，请检查 Print.js 库是否已正确引入。')
      console.error('Print.js Error:', e)
    }
  } else {
    ElMessage.error('打印容器未找到！')
  }
}

/**
 * 辅助函数：根据合同数据生成 HTML 结构 (单页)
 */
const generateContractBodyHtml = (contract: any): string => {
  // 🚨 修正点 1：将 contractProducts 改为 contract.products，与实际数据结构一致
  // 如果 contract.products 为空，则使用模拟的商品数据
  const productsList =
    contract.products?.length > 0
      ? contract.products
      : [
          { name: 'CRM系统基础模块 (模拟)', price: 50000.0, quantity: 1, total: 50000.0 },
          { name: '年度运维服务 (模拟)', price: 5000.0, quantity: 1, total: 5000.0 }
        ]

  const productsHtml = productsList
    .map(
      (p: any) =>
        `<tr>
            <td>${p.name || 'N/A'}</td>
            <td>￥${p.price?.toFixed(2) || '0.00'}</td>
            <td>${p.quantity || 1}</td>
            <td>￥${((p.price || 0) * (p.quantity || 1)).toFixed(2)}</td>
        </tr>`
    )
    .join('')

  // 🚨 修正点 2：根据实际数据字段进行绑定（如 name, number, customerName, amount, receivedAmount, signTime 等，这些都与您的数据结构一致）
  return `
        <div class="print-page-content">
            <div class="contract-title">【正式合同】${contract.name || 'N/A'} (编号: ${contract.number || 'N/A'})</div>

            <div class="info-section">
                <div class="info-item"><strong>客户名称：</strong>${contract.customerName || 'N/A'}</div>
                <div class="info-item"><strong>合同金额：</strong>￥${contract.amount?.toFixed(2) || '0.00'}</div>
                <div class="info-item"><strong>已回款项：</strong>￥${contract.receivedAmount?.toFixed(2) || '0.00'}</div>
                <div class="info-item"><strong>签约时间：</strong>${contract.signTime || 'N/A'}</div>
                <div class="info-item"><strong>合同有效期：</strong>${contract.startTime || 'N/A'} 至 ${contract.endTime || 'N/A'}</div>
            </div>

            <h3 style="margin-top: 30px;">合同商品及服务清单</h3>
            <table class="table-products">
                <thead>
                    <tr>
                        <th style="width: 40%;">名称</th>
                        <th style="width: 20%;">单价</th>
                        <th style="width: 10%;">数量</th>
                        <th style="width: 30%;">小计</th>
                    </tr>
                </thead>
                <tbody>
                    ${productsHtml}
                </tbody>
            </table>

            <div class="total-amount">
                合同总金额：￥${contract.amount?.toFixed(2) || '0.00'}
            </div>

            <div style="margin-top: 40px; border-top: 1px dashed #ccc; padding-top: 20px;">
                <p><strong>备注：</strong>${contract.remark || '无'}</p>
            </div>

            <div class="signature-area">
                <p>甲方（客户）：__________________</p>
                <p>乙方（签约方）：__________________</p>
            </div>
        </div>
    `
}
</script>
