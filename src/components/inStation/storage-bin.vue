<script setup lang="ts">

import { onMounted, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  getLCWarehouseList,
  getReportHistory,
  getReportToDoList,
  listWordListByParentCode,
  worksheetReport
} from '@/services/process-arameter.service'
import { getProductByWorksheetAndBindingId } from '@/services/machine-summary.service'

const prop = defineProps({
  id: {
    type: Number,
    required: true,
  },
  checkedTypeName: {
    type: String,
    required: true,
  },
  opsetDetailId: {
    type: Number,
    required: true,
  },
  workstationMessage: {
    type: Object,
    required: false,
    default: {} as any
  },
  sheetMessage: {
    type: Object,
    required: false,
    default: {} as any
  },
  datas: {
    type: Array<Object>,
    required: false,
    default: [] as any
  },
  unitMessage: {
    type: String,
    required: false,
    default: ''
  },
});
const emits = defineEmits(['close']);

// region 表格数据
// 表格数据
const tableData = ref<any>([]);
// 表格加载状态
const tableLoading = ref(false);
// 编辑配置
const editConfig = ref<any>({
  trigger: 'click',
  mode: 'cell'
});

// endregion



// region 初始化
function init() {
  tableLoading.value = true;
  getLCWarehouseList({
    worksheetCode: prop.sheetMessage?.workSheetCode,
  }).then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
      tableData.value = data;
    } else {
      message.error(`操作失败请联系管理员${msg}`)
    }
  }).catch((err) => {
    message.error(`操作失败请联系管理员,${err.message ? err.message : err}`)
  }).finally(() => {
    tableLoading.value = false;
  });
}

onMounted(() => {
  init();
});

// endregion


</script>

<template>
  <vxe-table
    :data="tableData"
    :loading="tableLoading"
    :edit-config="editConfig"
    :height="300"
    :style="{
      'max-width': `calc(100vw - 250px)`
    }"
  >
    <vxe-column type="seq" width="60"></vxe-column>
    <vxe-column field="materialCode" min-width="160" title="料号"></vxe-column>
    <vxe-column field="materialName" min-width="120" title="物料名称"></vxe-column>
<!--    <vxe-column field="batchCode" min-width="160" title="批次号"></vxe-column>-->
    <vxe-column field="warehouseCode" min-width="160" title="库位号"></vxe-column>
<!--    <vxe-column field="areaCode" min-width="160" title="储位号"></vxe-column>-->
    <vxe-column field="stockQuality" min-width="160" title="库存量"></vxe-column>
    <vxe-column field="unit" min-width="160" title="单位"></vxe-column>
  </vxe-table>
</template>

<style scoped lang="scss">
:deep(.nowFlag) {
  background: #d5d5d5;
}
:deep(.toBeCompleted) {
  background: #b8f5ba;
}
:deep(.completed) {
  background: #e3f5b8;
}
</style>
