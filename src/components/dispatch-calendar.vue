<script lang="ts" setup>

import { onMounted, ref, watch } from 'vue'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { type VxeTablePropTypes } from 'vxe-pc-ui'
import { getWorkCalendar } from '@/services/dispatch-calendar.service'
import { SearchOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import moment from 'moment'

const tableData = ref([] as any[])
// 单元格合并信息
const mergeCells = ref([] as any[])
// 表格头日期列表
const tableDate = ref({} as any)
// 表格头月份列表
const tableDateKeys = ref([] as any[])
// 查询参数
const queryParams = ref({} as any)
// 表格参数配置
const tablePage = ref({
  currentPage: 1,
  total: 50,
  pageSize: 99999
})
// 表格加载状态
const tableLoading = ref(false)

/**
 * 查询表格数据
 */
function queryData() {
  const params = {
    ...queryParams.value,
    pageNum: tablePage.value.currentPage,
    pageSize: tablePage.value.pageSize
  }
  if (params.time) {
    params.startDate = queryParams.value.time[0].format('YYYY-MM-DD')
    params.endDate = queryParams.value.time[1].format('YYYY-MM-DD')
    params.time = undefined
  } else {
    queryParams.value.time = [
      dayjs().startOf('month'),
      dayjs().add(1, 'month')
    ]
    params.startDate = queryParams.value.time[0].format('YYYY-MM-DD')
    params.endDate = queryParams.value.time[1].format('YYYY-MM-DD')
  }
  tableLoading.value = true
  getWorkCalendar(params).then(({ data }) => {
    if (data.code == 200) {
      const { data: { dayList, page: { list, total } } } = data
      tablePage.value.total = total
      tableDate.value = {}
      tableDateKeys.value = []
      // 获取日期列表
      for (let d of dayList) {
        // tableDate
        const date = moment(d, 'YYYY-MM-DD')
        const day = date.format('D')
        const m = date.format('M')
        if (tableDate.value[m] && tableDate.value[m].length > 0) {
          tableDate.value[m].push({
            label: day,
            value: d
          })
        } else {
          tableDate.value[m] = [
            {
              label: day,
              value: d
            }
          ]
          tableDateKeys.value.push(m)
        }
      }


      // 数据格式化
      tableData.value = []
      for (let item of list) {
        // 预计
        tableData.value.push({
          equipCode: item.equipCode,
          workSheetCode: item.workSheetCode,
          status: item.status,
          planCode: item.planCode,
          productCode: item.productCode,
          productName: item.productName,
          startTime: item.planStartDate,
          endTime: item.planEndDate,
          statusText: getStatusText(item.status),
          type: '预计'
        })
        // 实际
        tableData.value.push({
          equipCode: item.equipCode,
          workSheetCode: item.workSheetCode,
          status: item.status,
          planCode: item.planCode,
          productCode: item.productCode,
          productName: item.productName,
          startTime: item.actStartDate,
          endTime: item.actEndDate,
          statusText: getStatusText(item.status),
          type: '实际'
        })
      }
    } else {
      message.error({
        content: `操作失败请联系管理员${data.msg}`,

      })
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
  }).finally(() => {
    tableLoading.value = false
  })
}

/**
 * 获取状态中文描述
 * @param status
 */
function getStatusText(status: number) {
  switch (status) {
    case 0:
      return '已完成'
    case 1:
      return '未生产'
    case 2:
      return '生产中'
    case 3:
      return '足额完成'
    case 4:
      return '欠额完成'
    case 5:
      return '未完成'
    case 6:
      return '超额完成'
    case 7:
      return '未生产已派发'
  }
}

// 单元格样式设置
const cellStyle: VxeTablePropTypes.CellStyle = ({ row, column }) => {
  const backgroundColor = row.type === '实际' ? '#0f40f5' : '#cecece'
  let isRet = false
  console.log(column.field)
  if (column.field && dayjs(column.field).isValid()) {
    if (row.startTime) {
      isRet = dayjs(column.field).isBetween(row.startTime, row.endTime, 'day', '[]')
    } else {
      isRet = false
    }
  } else if (column.field === 'type') {
    isRet = true
  }
  if (isRet) {
    return {
      backgroundColor: backgroundColor,
      color: 'white'
    }
  }
  return undefined
}


onMounted(() => {
  dayjs.extend(isBetween)
  queryData()
})

watch(tableData.value, () => {
  mergeCells.value = []
  for (let i = 0, size = tableData.value.length; i < size; i += 2) {
    mergeCells.value.push(
      { row: i, col: 1, rowspan: 2, colspan: 1 }
    )
  }
})
</script>

<template>
  <div style="padding: 1em">

    <!--region 查询条件 -->
    <a-form layout="inline">
      <a-form-item label="设备号" name="price">
        <a-input
          v-model:value="queryParams.equipCode"
          placeholder="请输入设备号"
        />
      </a-form-item>
      <a-form-item label="工单号" name="price">
        <a-input
          v-model:value="queryParams.workSheetCode"
          placeholder="请输入工单号"
        />
      </a-form-item>
      <a-form-item label="时间范围" name="price">
        <a-range-picker v-model:value="queryParams.time" placeholder="" />
      </a-form-item>

      <a-form-item label="" name="">
        <a-button type="primary" @click="tablePage.currentPage = 1;queryData()">
          <template #icon>
            <SearchOutlined />
          </template>
          查询
        </a-button>
      </a-form-item>
    </a-form>
    <vxe-table
      :cell-style="cellStyle"
      :data="tableData"
      :merge-cells="mergeCells"
      header-cell-class-name="table_head"
      height="700"
    >
      <vxe-column fixed="left" type="seq" width="60"></vxe-column>
      <vxe-column field="equipCode" fixed="left" min-width="120" title="设备编号"></vxe-column>
      <vxe-column field="workSheetCode" fixed="left" min-width="120" title="工单号"></vxe-column>
      <vxe-column field="statusText" fixed="left" min-width="120" title="工单状态"></vxe-column>
      <vxe-column field="startTime" fixed="left" min-width="120" title="工单开始时间"></vxe-column>
      <vxe-column field="endTime" fixed="left" min-width="120" title="工单结束时间"></vxe-column>
      <vxe-column field="type" fixed="left" min-width="80" title=""></vxe-column>

      <vxe-colgroup v-for="(m, index) of tableDateKeys" :key="index" :title="m+ '月'">
        <vxe-column v-for="(d, i) of tableDate[m]" :key="i" :field="d.value" :title="d.label"
                    min-width="80"></vxe-column>
      </vxe-colgroup>
    </vxe-table>
  </div>
</template>

<style lang="scss" scoped>

</style>
