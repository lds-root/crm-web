<template>
  <div id="tradeBar" style="height: 100%; width: 100%"></div>
</template>

<script lang="ts" name="CustomerDataChart" setup>
import * as echarts from 'echarts'
import { onMounted, PropType, ref, watch } from 'vue'
import { TradeArray } from '@/api/interface'

const props = defineProps({
  data: {
    type: Object as PropType<TradeArray>,
    required: true
  }
})

const myChart = ref<echarts.ECharts | null>(null)

const initChart = () => {
  if (props.data?.timeList.length > 0) {
    const chartDom = document.getElementById('tradeBar')
    if (chartDom) {
      if (myChart.value) {
        myChart.value.dispose()
      }
      myChart.value = echarts.init(chartDom)

      const option = {
        tooltip: {
          trigger: 'item',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999'
            }
          }
        },
        legend: {
          data: ['客户数量']
        },
        xAxis: [
          {
            type: 'category',
            data: props.data?.timeList,
            axisPointer: {
              type: 'shadow'
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '客户数量'
          }
        ],
        series: [
          {
            name: '客户总量',
            type: 'bar',
            data: props.data?.countList
          },
          {
            name: '买入交易总量',
            type: 'line',
            data: props.data?.countList
          }
        ]
      }
      myChart.value.setOption(option)

      const handleResize = () => {
        myChart.value?.resize()
      }

      window.addEventListener('resize', handleResize)

      onMounted(() => {
        window.removeEventListener('resize', handleResize)
        myChart.value?.dispose()
      })
    }
  }
}

watch(
  () => props.data,
  (newData) => {
    if (newData?.timeList.length > 0) {
      initChart()
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (props.data?.timeList && props.data?.timeList.length > 0) {
    initChart()
  }
})
</script>
