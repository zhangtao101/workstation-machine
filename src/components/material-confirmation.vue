<script lang="ts" setup>

import { onMounted, ref } from 'vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import Reassignment from '@/components/productionDispatch/children/reassignment.vue'
import {
  getAllLine,
  getLineProductCheck,
  searchProduceWorkSheetList
} from '@/services/work-order-disassembly-and-consolidation.service'
import { message, Modal } from 'ant-design-vue'
import moment from 'moment'
import {
  clearWorksheetLcStock,
  cxWorksheetAudit,
  getCXNotAuditList,
  getWorksheetLcStock
} from '@/services/process-arameter.service'


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
    type: 2
  }
  if (params.time) {
    params.planDateStart = params.time[0]
    params.planDateEnd = params.time[1]
    params.time = undefined
  }
  tableLoading.value = true
  getCXNotAuditList(params).then(({ data }) => {
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


/**
 * 清理余量库存
 */
function clearanceCompleted(row: any) {
  Modal.confirm({
    title: '操作确认',
    content: '是否确认清料完成?',
    onOk() {
      row.loading = true;
      cxWorksheetAudit({
        worksheetCode: row.worksheetCode,
        audit: 1,
        auditUser: localStorage.getItem('username'),
      }).then(({ data: {code, data, msg} }) => {
        if (code == 200) {
          message.success('操作成功');
          clearSurplusStock();
          query();
        } else {
          message.error({
            content: `操作失败请联系管理员${msg}`,
          })
        }
      }).finally(() => {
        row.loading = false
      });
    },
    onCancel() {
      message.warning('已取消!');
    },
    class: 'test',
  });
}

// endregion

// region 余量库存

// 余量库存
const surplusStock = ref<any[]>([]);
const surplusStockLoading = ref(false);
// 当前选择的行
const selecttedRow = ref<any>({});

/**
 * 查看余量库存
 */
function viewSurplusInventory(row: any) {
  selecttedRow.value = row;
  surplusStockLoading.value = true;
  getWorksheetLcStock({
    worksheetCode: row.worksheetCode
  }).then(({ data: {code, data, msg} }) => {
    if (code == 200) {
      console.log(data)
      surplusStock.value = data;
    } else {
      message.error({
        content: `操作失败请联系管理员${msg}`,
      })
    }
  }).finally(() => {
    surplusStockLoading.value = false
  });
}
/**
 * 清理余量库存
 */
function inventoryClearance(row: any) {
  Modal.confirm({
    title: '操作确认',
    content: '是否确认清理库存?',
    onOk() {
      row.loading = true;
      clearWorksheetLcStock({
        worksheetCode: selecttedRow.value.worksheetCode,
        materialCode: row.materialCode,
        warehouseCode: row.warehouseCode,
        feedNumber: row.stockQuality,
        userCode: localStorage.getItem('username'),
      }).then(({ data: {code, data, msg} }) => {
        if (code == 200) {
          message.success('操作成功');
          viewSurplusInventory(selecttedRow.value);
        } else {
          message.error({
            content: `操作失败请联系管理员${msg}`,
          })
        }
      }).finally(() => {
        row.loading = false
      });
    },
    onCancel() {
      message.warning('已取消!');
    },
    class: 'test',
  });
}

function clearSurplusStock() {
  surplusStock.value = [];
  selecttedRow.value = {};
}

// endregion


onMounted(() => {
  query()
})
</script>

<template>
  <div class="container">
    <!--region 查询条件 -->
    <a-form layout="inline">
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
        border
        header-cell-class-name="table_head"
        height="300"
      >
        <vxe-column type="seq" width="60"></vxe-column>
        <vxe-column field="worksheetCode" min-width="180" title="工单号"></vxe-column>
        <vxe-column field="productCode" min-width="120" title="产品编号"></vxe-column>
        <vxe-column field="productName" min-width="280" title="产品名称"></vxe-column>
        <vxe-column field="workstationCode" min-width="280" title="工作站编号"></vxe-column>
        <vxe-column field="workSheetPlanNumber" min-width="280" title="工单计划产量"></vxe-column>
        <vxe-column min-width="250" title="操作" fixed="right">
          <template #default="{ row }">
            <a-button type="primary" @click="viewSurplusInventory(row)">
              查看余料库存
            </a-button>
            &nbsp;
            <a-button type="primary" @click="clearanceCompleted(row)">
              清料完成
            </a-button>
          </template>
        </vxe-column>
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

    <!-- region 余量库存 -->
      <div v-if="selecttedRow.worksheetCode">
        <h3>余量库存-{{selecttedRow.worksheetCode}}</h3>
        <vxe-table
          ref="dataTable"
          :data="surplusStock"
          :loading="surplusStockLoading"
          border
          header-cell-class-name="table_head"
          height="300"
          style="margin-top: 1em;"
        >
          <vxe-column type="seq" width="60"></vxe-column>
          <vxe-column field="materialCode" min-width="140" title="料号"></vxe-column>
          <vxe-column field="materialName" min-width="180" title="物料名称"></vxe-column>
          <vxe-column field="warehouseCode" min-width="140" title="料仓号"></vxe-column>
          <vxe-column field="stockQuality" min-width="140" title="库存量"></vxe-column>
          <vxe-column field="unit" min-width="140" title="单位"></vxe-column>
          <vxe-column min-width="120" title="操作" fixed="right">
            <template #default="{ row }" >
              <a-button type="primary" @click="inventoryClearance(row)" danger :loading="row.loading">
                清库存
              </a-button>
            </template>
          </vxe-column>
        </vxe-table>
      </div>
    <!-- endregion -->
  </div>
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
