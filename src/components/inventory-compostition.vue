<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import {
  listWarehouseRecord,
  listWarehouseStock,
  outWarehouseRecord
} from '@/services/firing.service'
import { type VxeTablePropTypes } from 'vxe-pc-ui'
import { humanLogin, humanLogout } from '@/services/machine-summary.service'

// region 数据查询

// 查询参数
const queryParams = ref({} as any)

// 表格数据
const tableData = ref([] as any)
// 表格加载状态
const tableLoading = ref(false)
// 表格对象
const dataTable = ref()
// 编辑配置
const editConfig = ref<VxeTablePropTypes.EditConfig>({
  trigger: 'click',
  mode: 'cell'
})
// 设备名称
const equipmentCode = localStorage.getItem('equipmentCode')

const pageSize = ref(20);
const pageNumber = ref(1);
const total = ref(0);

/**
 * 查询表格数据
 */
function query() {
  const params = {
    ...queryParams.value
  }
  /*if (equipmentName?.includes('抛光') || equipmentName?.includes('湿磨')) {
    params.warehouseCode = 'JP'
    params.areaCode = 'JP'
  }*/
  params.workstationCode = equipmentCode;
  params.pageSize = pageSize.value;
  params.pageNum = pageNumber.value;
  tableLoading.value = true
  listWarehouseStock(params)
    .then(({ data: { code, data: { dataList, total: num}, msg } }) => {
      if (code == 200) {
        tableData.value = dataList;
        total.value = num;
      } else {
        message.error(`操作失败请联系管理员${msg}`)
      }
    })
    .catch((err) => {
      message.error({
        content: `操作失败请联系管理员,${err.message ? err.message : err}`
      })
    })
    .finally(() => {
      tableLoading.value = false
    })
}
// endregion

// region 用户操作

// 用户名

const userName = ref()
// 当前已登录的用户名
const loginUser = ref()

/**
 * 退出登录
 */
function logout() {
  humanLogout(userName.value, localStorage.equipmentCode)
    .then(({ data }: any) => {
      if (data.code == 200) {
        loginUser.value = ''
        localStorage.clear()
        location.reload()
      } else {
        message.error({
          content: `操作失败请联系管理员${data.msg}`
        })
      }
    })
    .catch((err) => {
      message.error({
        content: `操作失败请联系管理员,${err.message ? err.message : err}`
      })
    })
}

// endregion

onMounted(() => {
  query()
})
</script>

<template>
  <div class="container">
    <div>
      <a-popconfirm
        cancel-text="取消"
        ok-text="退出"
        placement="leftTop"
        title="是否确认退出登录?"
        @confirm="logout"
      >
        <a-button style="position: absolute; right: 1em" type="primary"> 退出登录</a-button>
      </a-popconfirm>
    </div>
    <!--region 查询条件 -->
    <a-form layout="inline">
      <a-form-item label="储位" name="warehouseCode">
        <a-input v-model:value="queryParams.areaCode" placeholder="请输入库位代码" />
      </a-form-item>
      <a-form-item label="库位" name="warehouseCode">
        <a-input v-model:value="queryParams.warehouseCode" placeholder="请输入库位代码" />
      </a-form-item>
      <a-form-item label="料号" name="productCode">
        <a-input v-model:value="queryParams.productCode" placeholder="请输入料号" />
      </a-form-item>
      <a-form-item label="产品名称" name="productName">
        <a-input v-model:value="queryParams.productName" placeholder="请输入产品名称" />
      </a-form-item>
      <a-form-item label="批次号" name="batchCode">
        <a-input v-model:value="queryParams.batchCode" placeholder="请输入批次号" />
      </a-form-item>
      <a-form-item label="工单号" name="workstationCode">
        <a-input v-model:value="queryParams.worksheetCode" placeholder="请输入工单号" />
      </a-form-item>

      <a-form-item label="">
        <a-button type="primary" @click="query()">
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
        :edit-config="editConfig"
        border
        header-cell-class-name="table_head"
        height="300"
      >
        <vxe-column type="seq" width="60"></vxe-column>
        <vxe-column field="materialCode" min-width="140" title="料号"></vxe-column>
        <vxe-column field="materialName" min-width="180" title="物料名称"></vxe-column>
        <vxe-column field="batchCode" min-width="180" title="批次号"></vxe-column>
        <vxe-column field="warehouseCode" min-width="120" title="库位号"></vxe-column>
        <vxe-column field="areaCode" min-width="120" title="储位号"></vxe-column>
        <vxe-column field="stockQuality" min-width="120" title="库存量"></vxe-column>
        <vxe-column field="unit" min-width="120" title="单位"></vxe-column>
      </vxe-table>
      <vxe-pager
        v-model:currentPage="pageNumber"
        v-model:pageSize="pageSize"
        :total="total"
        @page-change="query">
      </vxe-pager>
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
      margin: 0 0.5em;
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
        margin-left: 0.5em;
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
