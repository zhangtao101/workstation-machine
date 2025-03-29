<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import {
  finishWorksheetInOut,
  getWorksheetWarehouseList
} from '@/services/work-order-disassembly-and-consolidation.service'
import { message } from 'ant-design-vue'

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
// 工作站名称
const equipmentName = localStorage.equipmentName

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
  // 查询参数
  const params = {
    ...queryParams.value,
    pageNum: tablePage.value.currentPage,
    pageSize: tablePage.value.pageSize,
    workstationCode: localStorage.equipmentCode,
    type: 1
  }
  if (params.time) {
    params.startTime = params.time[0].format('YYYY-MM-DD')
    params.endTime = params.time[1].format('YYYY-MM-DD')
    params.time = undefined
  }
  tableLoading.value = true
  getWorksheetWarehouseList(params)
    .then(({ data }) => {
      if (data.code == 200) {
        const {
          data: { list, totalSize }
        } = data
        tableData.value = list
        tablePage.value.total = totalSize
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
    .finally(() => {
      tableLoading.value = false
    })
}

// endregion

// region 补入库
// 显示补入库抽屉
const showDrawer = ref(false)
// 当前补入库对象
const editItem = ref<any>({})
const fillInTheDatabaseData = ref<any>({})
/**
 * 显示工单补入库抽屉
 * @param row
 */
function displaysTheFillLibrary(row: any) {
  showDrawer.value = true
  editItem.value = { ...row }
  if (equipmentName.includes('烧成')) {
    fillInTheDatabaseData.value.warehouseCode = 'JP'
  } else if (equipmentName.includes('卧干')) {
    fillInTheDatabaseData.value.warehouseCode = 'CXXN'
  }
}

/**
 * 关闭补入库抽屉
 */
function onClose() {
  showDrawer.value = false
  editItem.value = {}
  fillInTheDatabaseData.value = {}
}

/**
 * 补入库
 */
function submit() {
  editItem.value.loading = true
  finishWorksheetInOut({
    workstationCode: localStorage.equipmentCode,
    worksheetCode: editItem.value.workSheetCode,
    inUser: localStorage.username,
    ...fillInTheDatabaseData.value
  })
    .then(({ data: { code, data, msg } }) => {
      console.log(code, data, msg)
      if (code == 200) {
        message.success({
          content: '操作成功'
        })
        query()
        onClose()
      } else {
        message.error(msg)
      }
    })
    .finally(() => {
      editItem.value.loading = false
    })
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
      <a-form-item label="工单生产时间" name="price">
        <a-range-picker v-model:value="queryParams.time" placeholder="" />
      </a-form-item>
      <a-form-item label="工单号" name="price">
        <a-input v-model:value="queryParams.workSheetCode" placeholder="请输入工单号" />
      </a-form-item>
      <a-form-item label="产品编号" name="price">
        <a-input v-model:value="queryParams.productCode" placeholder="请输入产品编号" />
      </a-form-item>
      <a-form-item label="" name="">
        <a-button
          type="primary"
          @click="
            () => {
              tablePage.currentPage = 1
              query()
            }
          "
        >
          <template #icon>
            <SearchOutlined />
          </template>
          查询
        </a-button>
      </a-form-item>
    </a-form>
    <!-- endregion -->

    <!--region 表格 -->
    <vxe-table
      ref="dataTable"
      :data="tableData"
      :loading="tableLoading"
      :radio-config="{ trigger: 'row', highlight: true }"
      border
      header-cell-class-name="table_head"
      height="450"
    >
      <vxe-column type="seq" width="60"></vxe-column>
      <vxe-column field="lineName" min-width="180" title="工单批次号"></vxe-column>
      <vxe-column field="workSheetCode" min-width="180" title="工单号"></vxe-column>
      <vxe-column field="processName" min-width="120" title="报工工序"></vxe-column>
      <vxe-column field="productCode" min-width="120" title="产品编号"></vxe-column>
      <vxe-column field="productName" min-width="280" title="产品名称"></vxe-column>
      <vxe-column field="workSheetPlanNumber" min-width="120" title="工单计划数"></vxe-column>
      <vxe-column field="warehouseNumberM2" min-width="180" title="工单入库数"></vxe-column>
      <vxe-column field="workSheetFinishNumber" min-width="180" title="工单报工数"></vxe-column>
      <vxe-column field="sideNo" min-width="160" title="工单结束时间"></vxe-column>
      <vxe-column field="planDateStart" min-width="160" title="工单计划开始时间"></vxe-column>
      <vxe-column min-width="160" title="操作" fixed="right">
        <template #default="{ row }">
          <a-button type="link" @click="displaysTheFillLibrary(row)"> 工单补入库 </a-button>
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
    <!-- endregion -->
  </div>

  <a-drawer
    :width="500"
    title="工单补入库"
    :open="showDrawer"
    @close="onClose"
    :footer-style="{ textAlign: 'right' }"
  >
    <a-form :model="fillInTheDatabaseData" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
      <a-form-item
        label="批次号"
        name="batchCode"
        :rules="{
          required: true,
          message: '该项为必填项'
        }"
        v-if="equipmentName.includes('打包')"
      >
        <a-input v-model:value="fillInTheDatabaseData.batchCode" />
      </a-form-item>
      <a-form-item label="库位" v-else>
        <a-input v-model:value="fillInTheDatabaseData.warehouseCode" readonly />
      </a-form-item>
      <a-form-item label="已入库数量" name="name">
        <span style="margin-right: 1em">
          {{ editItem.warehouseNumber }} {{ editItem.unit }}</span
        >
        <span v-if="editItem.unit === 'KG'">
          {{ (editItem.warehouseNumber / 1000).toFixed(3) }} T</span
        >
        <span v-if="editItem.unit === '片'">
          {{ editItem.warehouseNumberM2 }} ㎡</span
        >
      </a-form-item>
      <a-form-item
        label="入库数量"
        name="number"
        :rules="{
          required: true,
          message: '该项为必填项'
        }"
      >
        <a-input-number
          v-model:value="fillInTheDatabaseData.number"
          :addon-after="editItem.unit"
          :min="0"
          :style="{
            marginBottom: '1em'
          }"
          @Change="
            () => {
              fillInTheDatabaseData.number_T = (fillInTheDatabaseData.number / 1000).toFixed(3)
              fillInTheDatabaseData.qualityNumber_pf = (
                fillInTheDatabaseData.number * editItem.zhxs
              ).toFixed(3)
            }
          "
        />
        <a-input-number
          v-model:value="fillInTheDatabaseData.number_T"
          addon-after="T"
          :min="0"
          v-if="editItem.unit === 'KG'"
          @Change="
            () => {
              fillInTheDatabaseData.number = (fillInTheDatabaseData.number_T * 1000).toFixed(3)
            }
          "
        />
        <a-input-number
          v-model:value="fillInTheDatabaseData.qualityNumber_pf"
          addon-after="㎡"
          :min="0"
          v-if="editItem.unit === '片'"
          readonly
        />
      </a-form-item>
      <a-form-item
        label="包装箱数量"
        name="packageNumber"
        :rules="{
          required: true,
          message: '该项为必填项'
        }"
        v-if="equipmentName.includes('打包')"
      >
        <a-input-number v-model:value="fillInTheDatabaseData.packageNumber" />
      </a-form-item>
    </a-form>

    <template #footer>
      <a-button style="margin-right: 8px" @click="onClose()">取消</a-button>
      <a-button type="primary" @click="submit()" :loading="editItem.loading">确认选择</a-button>
    </template>
  </a-drawer>
</template>

<style lang="scss" scoped>
.container {
  ::v-deep(.table_head) {
    background-color: #1677ff;
    color: white;
  }
}
</style>
