<script setup lang="ts">

import { onMounted, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  cxMaterialSetReport,
  getCxSetListByWorksheetCode,
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

// region 提交

function submit() {
  const params: any[] = [];
  let sum = 0;
  tableData.value.forEach((item: any) => {
    sum += item.perDosage;
    params.push({
      worksheetCode: prop.sheetMessage?.workSheetCode,
      bindingId: prop.id,
      perDosage: item.perDosage / 100,
      materialCode: item.materialCode,
    });
  });
  if (sum > 100) {
    message.error('配比总和不能为大于100%');
    return;
  } else if (sum < 100) {
    Modal.confirm({
      title: '操作确认',
      content: '当前配比总和小于100%, 是否确认操作 ?',
      onOk() {
        cxMaterialSetReport(params).then(({ data: { code, data, msg } }) => {
          if (code == 200) {
            message.success('提交成功');
            init();
          }
        });
      },
      onCancel() {
        message.warning('已取消!');
      },
      class: 'test',
    });
  } else {
    cxMaterialSetReport(params).then(({ data: { code, data, msg } }) => {
      if (code == 200) {
        message.success('提交成功');
        init();
      }
    });
  }
}

// endregion



// region 初始化
function init() {
  tableLoading.value = true;
  getCxSetListByWorksheetCode({
    worksheetCode: prop.sheetMessage?.workSheetCode,
  }).then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
      data.forEach((item: any) => {
        item.perDosage = item.perDosage * 100;
      })
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
  <a-button type="primary" @click="submit " style="margin-bottom: 1em;">提交</a-button>
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
    <vxe-column field="perDosage" min-width="160" title="标准配比(%)">
      <template #default="{ row }">
        <a-input-number v-model:value="row.perDosage"></a-input-number>
      </template>
    </vxe-column>
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
