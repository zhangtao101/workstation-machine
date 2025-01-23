<script lang="ts" setup>

import { onMounted, ref } from 'vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import {
  getAllLine,
  mergeWorkSheet,
  searchProduceWorkSheetList,
  splitWorkSheet
} from '@/services/work-order-disassembly-and-consolidation.service'
import { message } from 'ant-design-vue'
import moment from 'moment'

// region 数据查询

// 查询参数
const queryParams = ref({} as any)
// 表格参数配置
const tablePage = ref({
  currentPage: 1,
  total: 50,
  pageSize: 20
})
// 表格数据
const tableData = ref([] as any)
// 表格加载状态
const tableLoading = ref(false)
// 表格对象
const dataTable = ref()

/**
 * 页码改变
 */
function handlePageChange() {
  query()
}

/**
 * 查询表格数据
 */
function query() {
  const params = {
    ...queryParams.value,
    pageNum: tablePage.value.currentPage,
    pageSize: tablePage.value.pageSize,
    type: 1
  }
  if (params.time) {
    params.planDateStart = params.time[0]
    params.planDateEnd = params.time[1]
    params.time = undefined
  }
  tableLoading.value = true
  searchProduceWorkSheetList(params).then(({ data }) => {
    if (data.code == 200) {
      const { data: { list, total } } = data
      tableData.value = list
      tablePage.value.total = total
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

const lineList = ref([] as any)

/**
 * 查询所有线别
 */
function queryLine() {
  getAllLine({ processType: 1 }).then(({ data }) => {
    if (data.code == 200) {
      lineList.value = data.data
    } else {
      message.error({
      content: `操作失败请联系管理员${data.msg}`,

    })
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
  })
}

// endregion

// region 底部操作
const exigency = ref([
  { label: '是', value: true },
  { label: '否', value: false }
])
// 拆合单数据
const additional = ref({
  urgencyFlag: false,
  planWorkNumber: 0,
  quantityNotOffLine: 99999,
  splitNumber: undefined,
  planStartDate: undefined,
  remark: ''
} as any)
// 是否显示拆合单操作栏
const showAdditional = ref(false)
// 操作状态 1: 拆单 2:合单
const status = ref(1)

/**
 * 拆单
 */
function openOrder() {
  // 获取当前选中的表格行
  const checkboxRecords = dataTable.value.getCheckboxRecords()
  if (checkboxRecords.length !== 1) {
    message.error('请选择一条数据进行拆单!')
  } else {
    additional.value.id = checkboxRecords[0].id
    additional.value.quantityNotOffLine = checkboxRecords[0].produceNotFinishNumber
    showAdditional.value = true
    status.value = 1
  }
}

/**
 * 合单
 */
function joiningOrders() {
  // 获取当前选中的表格行
  const checkboxRecords = dataTable.value.getCheckboxRecords()
  additional.value.ids = []
  if (checkboxRecords.length < 2) {
    message.error('请至少选择两条数据进行合单!')
  } else {
    const planCode = checkboxRecords[0].planCode
    additional.value.quantityNotOffLine = 0
    for (let item of checkboxRecords) {
      if (planCode !== item.planCode) {
        message.error('请确认选中的数据为同一的计划号!')
        return
      }
      additional.value.quantityNotOffLine += item.produceNotFinishNumber
      additional.value.ids.push(item.id)
    }
    showAdditional.value = true
    additional.value.splitNumber = 1
    additional.value.planWorkNumber = additional.value.quantityNotOffLine
    status.value = 2
  }
}

// 工单提交状态
const orderLoading = ref(false)

/**
 * 拆单/合单 提交
 */
function orderSubmit() {
  const params = { ...additional.value }
  params.planStartDate = moment(params.planStartDate).format('YYYY-MM-DD HH:mm:ss')
  params.urgencyFlag = params.urgencyFlag ? 1 : 2
  orderLoading.value = true
  let ob
  if (status.value === 1) {
    ob = splitWorkSheet(params)
  } else {
    ob = mergeWorkSheet(params)
  }
  ob.then(
    ({ data }) => {
      if (data.code == 200) {
        showAdditional.value = false
        additional.value = {
          urgencyFlag: false
        }
        query()
      } else {
        message.error(`操作失败!${data.msg}`)
      }
    }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
  }).finally(() => {
    orderLoading.value = false
  })
}

// endregion

onMounted(() => {
  query()
  queryLine()
})
</script>

<template>
  <div class="container">
    <!--region 查询条件 -->
    <a-form layout="inline">
      <a-form-item label="工单号" name="price">
        <a-input
          v-model:value="queryParams.workSheetCode"
          placeholder="请输入工单号"
        />
      </a-form-item>
      <a-form-item label="计划时间" name="price">
        <a-range-picker v-model:value="queryParams.time" placeholder="" />
      </a-form-item>
      <a-form-item label="计划号" name="price">
        <a-input
          v-model:value="queryParams.planCode"
          placeholder="请输入计划号"
        />
      </a-form-item>
      <a-form-item label="产品编号" name="price">
        <a-input
          v-model:value="queryParams.productCode"
          placeholder="请输入产品编号"
        />
      </a-form-item>
      <a-form-item label="产品名称" name="price">
        <a-input
          v-model:value="queryParams.productName"
          placeholder="请输入产品名称"
        />
      </a-form-item>
      <a-form-item label="产线" name="price">
        <a-select
          ref="select"
          v-model:value="queryParams.lineId"
          allow-clear
          style="width: 120px"
        >
          <a-select-option v-for="(item, index) of lineList" :key="index" :value="item.id">{{ item.lineName }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="" name="">
        <a-button type="primary" @click="tablePage.currentPage = 1;query()">
          <template #icon>
            <SearchOutlined />
          </template>
          查询
        </a-button>
      </a-form-item>
    </a-form>
    <!-- endregion -->

    <!--region 操作按钮 -->
    <div class="operation">
      <a-button type="primary" @click="openOrder">
        拆单
      </a-button>
      <a-button type="primary" @click="joiningOrders">
        合单
      </a-button>
    </div>
    <!-- endregion -->

    <!--region 表格 -->
    <div>
      <vxe-table
        ref="dataTable"
        :checkbox-config="{trigger: 'row',checkStrictly:true}"
        :data="tableData"
        :loading="tableLoading"
        border
        header-cell-class-name="table_head"
        height="300"
      >

        <vxe-column fixed="left" name="''" type="checkbox" width="60"></vxe-column>
        <vxe-column type="seq" width="60"></vxe-column>
        <vxe-column field="workSheetCode" min-width="120" title="工单号"></vxe-column>
        <vxe-column field="planDateStart" min-width="120" title="计划时间"></vxe-column>
        <vxe-column field="productCode" min-width="120" title="产品编号"></vxe-column>
        <vxe-column field="productName" min-width="280" title="产品名称"></vxe-column>
        <vxe-column field="lineName" min-width="120" title="任务线别"></vxe-column>
        <vxe-column field="subProductCode" min-width="120" title="部件编号"></vxe-column>
        <vxe-column field="subProductName" min-width="280" title="部件名称"></vxe-column>
        <vxe-column field="subPlanCode" min-width="120" title="部件计划号"></vxe-column>
        <vxe-column field="subPlanNumber" min-width="120" title="部件计划数量"></vxe-column>
        <vxe-column field="produceUnarrangedNumber" min-width="120" title="生产未排数"></vxe-column>
        <vxe-column field="produceNotFinishNumber" min-width="120" title="生产未完数"></vxe-column>
        <vxe-column field="workSheetPlanNumber" min-width="120" title="工单计划数"></vxe-column>
        <vxe-column field="workSheetFinishNumber" min-width="120" title="工单完成数"></vxe-column>
        <vxe-column field="planCode" min-width="120" title="计划号"></vxe-column>
        <vxe-column field="produceWorkshop" min-width="120" title="生产车间"></vxe-column>
        <vxe-column field="remark" min-width="120" title="备注"></vxe-column>
      </vxe-table>
      <vxe-pager
        v-model:current-page="tablePage.currentPage"
        v-model:page-size="tablePage.pageSize"
        :layouts="[
        'PrevJump',
        'PrevPage',
        'JumpNumber',
        'NextPage',
        'NextJump',
        'Sizes',
        'FullJump',
        'Total'
      ]"
        :total="tablePage.total"
        @page-change="handlePageChange"
      >
      </vxe-pager>
    </div>
    <!-- endregion -->

    <!--region 底部操作信息 -->
    <div v-if="showAdditional" class="bottom_operation">
      <div>
        <a-row>
          <a-col :span="8">
            <label>紧急批</label>
            <a-radio-group v-model:value="additional.urgencyFlag" :options="exigency" />
          </a-col>
          <a-col :span="8">
            <label>未下线数量</label>
            <span>{{ additional.quantityNotOffLine }}</span>
          </a-col>
          <a-col :span="8">
            <label>下线数量</label>
            <a-input-number
              v-model:value="additional.planWorkNumber"
              :disabled="status === 2"
              :max="additional.quantityNotOffLine"
              :min="0"
              placeholder="下线数量"
              style="width: calc(100% - 120px)"
            />
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="8">
            <label>开立批数</label>
            <a-input-number
              v-model:value="additional.splitNumber"
              :disabled="status === 2"
              :min="0"
              placeholder="开立批数"
              style="width: calc(100% - 120px)"
            />
          </a-col>
          <a-col :span="8">
            <label>预计开立日</label>
            <a-date-picker v-model:value="additional.planStartDate" placeholder="预计开立日"
                           style="width: calc(100% - 120px)" />
          </a-col>
          <a-col :span="8">
            <label>备注说明</label>
            <a-textarea
              v-model:value="additional.remark"
              auto-size
              placeholder="备注说明"
              style="width: calc(100% - 120px)"
            />
          </a-col>
        </a-row>
        <a-row>
          <a-col :offset="16" :span="8">
            <a-button
              :loading="orderLoading"
              style="margin-left: 100px;"
              type="primary"
              @click="orderSubmit"
            >确认
            </a-button>
          </a-col>
        </a-row>
      </div>
    </div>
    <!-- endregion -->
  </div>
</template>

<style lang="scss" scoped>
.container {
  padding: 1em 5%;
  max-height: calc(100vh - 2em);
  overflow: auto;

  // 操作
  .operation {
    margin: 1em 0;

    & > * {
      margin: 0 .5em;
    }
  }

  // 底部操作
  .bottom_operation {
    border: 1px solid rgb(219, 200, 253);
    padding: 1em;
    margin-bottom: 5em;
    background: rgb(241, 233, 254);
    display: flex;
    justify-content: center;

    & > div {
      width: 95%;
    }

    label {
      width: 90px;
      display: inline-block;
      text-align: right;
      margin-right: 1em;
      line-height: 30px;
      vertical-align: top;

      &:after {
        content: ':';
        margin-left: .5em;
      }
    }

    span {
      line-height: 30px;
    }
  }

  ::v-deep(.table_head) {
    background-color: #1677ff;
    color: white;
  }

  ::v-deep(.ant-row) {
    margin-bottom: 1em;
  }
}

</style>
