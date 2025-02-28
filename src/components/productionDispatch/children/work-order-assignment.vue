<script lang="ts" setup>

import { onMounted, ref } from 'vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import Reassignment from '@/components/productionDispatch/children/reassignment.vue'
import {
  getAllLine,
  getLineProductCheck,
  searchProduceWorkSheetList
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
  if (deviceList.value.length > 0) {deviceList.value = []}
  const params = {
    ...queryParams.value,
    pageNum: tablePage.value.currentPage,
    pageSize: tablePage.value.pageSize,
    type: 1
  }
  if (params.time) {
    params.planDateStart = params.time[0].format('YYYY-MM-DD')
    params.planDateEnd = params.time[1].format('YYYY-MM-DD')
    params.time = undefined
  }
  tableLoading.value = true
  searchProduceWorkSheetList(params).then(({ data }) => {
    if (data.code == 200) {
      const { data: { list, totalSize } } = data
      tableData.value = list
      tablePage.value.total = totalSize
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
// 设备列表
const deviceList = ref([] as any)
const deviceListLoading = ref(false)
// 当前选中的行
const selectRow = ref()

/**
 * 表格单选框值改变
 * @param newValue 新选中的值
 */
function radioChange(newValue: any) {
  selectRow.value = newValue.row
  queryingDeviceInformation()
}

/**
 * 查询对应的设备信息
 * @param id
 */
function queryingDeviceInformation() {
  deviceListLoading.value = true;
  getLineProductCheck({
    worksheetCode: selectRow.value.id,
    type: selectRow.value.processType
  }).then(({ data }) => {
    if (data.code == 200) {
      deviceList.value = data.data
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
    deviceListLoading.value = false;
  })
}

// endregion

// region 派工

const reassignmentRef = ref()

/**
 * 显示抽屉
 * @param equipCode 设备编号
 */
function showReassignment(equipCode: string) {
  reassignmentRef.value.toggle(equipCode, selectRow.value.workSheetCode, selectRow.value.id, 1)
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
<!--      <a-form-item label="产线" name="price">
        <a-select
          ref="select"
          v-model:value="queryParams.lineId"
          allow-clear
          style="width: 120px"
        >
          <a-select-option v-for="(item, index) of lineList" :key="index" :value="item.id">{{ item.lineName }}
          </a-select-option>
        </a-select>
      </a-form-item>-->
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

    <!--region 表格 -->
    <div>
      <vxe-table
        ref="dataTable"
        :data="tableData"
        :loading="tableLoading"
        :radio-config="{trigger: 'row', highlight: true}"
        border
        header-cell-class-name="table_head"
        height="300"
        @radio-change="radioChange"
      >

        <vxe-column fixed="left" name="''" type="radio" width="60"></vxe-column>
        <vxe-column type="seq" width="60"></vxe-column>
        <vxe-column field="workSheetCode" min-width="180" title="工单号"></vxe-column>
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
        <vxe-column field="planCode" min-width="180" title="计划号"></vxe-column>
        <vxe-column field="produceWorkshop" min-width="120" title="生产车间"></vxe-column>
        <vxe-column field="remark" min-width="160" title="备注"></vxe-column>
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
    <!-- region 底部操作 -->
    <a-spin :spinning="deviceListLoading">
      <div v-if="deviceList.length > 0" class="bottom_operation">
        <h2>指派设备</h2>
        <div>
          <div v-for="(item, i) of deviceList" :key="i" class="device_item">
            <div :class="{
            device_item_header: true,
            device_item_success: item.status === 1,
            device_item_warning: item.status === 2,
            device_item_error: item.status === 3,
          }"></div>
            <div>
              <label>设备编号</label>
              <a-tooltip :title="item.equipCode">
              <span>
                {{ item.equipCode }}
              </span>
              </a-tooltip>
            </div>
            <div>
              <label>设备名称</label>
              <a-tooltip :title="item.equipName">
              <span>
                {{ item.equipName }}
              </span>
              </a-tooltip>
            </div>
            <div>
              <label>待生产数量</label>
              <span>
              {{ item.waitProduceNumber }}
            </span>
            </div>
            <div>
              <label>待生产工单数</label>
              <span>
              {{ item.waitSheetNumber }}
            </span>
            </div>
            <div>
              <label>预计开始时间</label>
              <span>
              {{ moment(item.planStartTime).format('YYYY-MM-DD HH:mm:ss') }}
            </span>
            </div>
            <div style="display: flex;justify-content: center;">
              <a-button type="primary" @click="showReassignment(item.equipCode)">派工</a-button>
            </div>
          </div>
        </div>
      </div>
    </a-spin>
    <!-- endregion -->
  </div>
  <reassignment ref="reassignmentRef" @send="query" />
</template>

<style lang="scss" scoped>

.container {
  padding: 0 5%;
  max-height: 100vh;
  overflow: auto;

  // 底部操作
  .bottom_operation {
    margin-bottom: 5em;

    & > div {
      display: flex;
      flex-wrap: wrap;
      // 设备列表
      .device_item {
        width: 250px;
        margin: .5em;
        border-radius: 1em;
        line-height: 1.5em;
        border: 1px solid #ccc;
        padding-bottom: 1em;

        .device_item_header {
          height: 1em;
          border-radius: 1em 1em 0 0;
          margin-bottom: .5em;
          background: rgb(149 149 149);

          &.device_item_success {
            background: rgb(38, 250, 5) !important;
          }

          &.device_item_warning {
            background: rgb(252, 202, 0) !important;
          }

          &.device_item_error {
            background: rgb(189, 49, 36) !important;
          }
        }

        label {
          display: inline-block;
          width: 130px;
          padding-right: .5em;
          box-sizing: border-box;
          text-align: right;
          vertical-align: top;

          &:after {
            content: ":";
          }
        }

        span {
          display: inline-block;
          width: calc(100% - 140px);
        }
      }
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
