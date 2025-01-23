<script setup lang="ts">

import { onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import { getParamToDoList } from '@/services/process-arameter.service'
import ProcessConfigurationOperation from '@/components/inStation/process-configuration-operation.vue'

const prop = defineProps({
  id: {
    type: Number,
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
  }
});

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

// region 采集上报
const selectedRow = ref<any>();
const isShow = ref(false);

/**
 * 采集上报
 * @param row
 */
function collectionAndReporting(row: any) {
  selectedRow.value = row;
  isShow.value = true;
}

function close() {
  selectedRow.value = undefined;
  isShow.value = false;
  init()
}

// endregion


// region 初始化

function init() {
  tableLoading.value = true;
  getParamToDoList({
    workstationCode: prop.workstationMessage?.workstationCode,
    worksheetCode: prop.sheetMessage?.workSheetCode,
    bindingId: prop.id,
    opsetDetailId: prop.opsetDetailId,
  }).then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
      tableData.value = data;
    } else {
      message.error({
        content: `操作失败请联系管理员${msg}`,

      })
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
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
    border
    :data="tableData"
    :loading="tableLoading"
    :edit-config="editConfig"
    header-align="center"
    header-cell-class-name="table_head"
    :height="300"
    style="max-width: calc(100vw - 270px);"
    :rowClassName="({ row }: any) => {
      if (row.catchStatus === 1) {
        return 'completed';
      } else if (row.catchStatus === 2) {
        return 'error';
      } else {
        return 'toBeCompleted';
      }
    }"
  >
    <vxe-column type="seq" width="60"></vxe-column>
    <vxe-column field="catchCode" min-width="120" title="任务编号"></vxe-column>
    <vxe-column field="worksheetCode" min-width="180" title="工单号"></vxe-column>
    <vxe-column field="catchTypeName" min-width="120" title="采集类型"></vxe-column>
    <vxe-column field="catchDataTypeName" min-width="120" title="采集对象"></vxe-column>
    <vxe-column field="catchTime" min-width="160" title="任务执行时间"></vxe-column>
    <vxe-column field="statusName" min-width="120" title="任务执行状态"></vxe-column>
    <vxe-column title="操作" min-width="180" fixed="right">
      <template #default="{ row }">
        <vxe-button
          mode="text"
          status="primary"
          @click="collectionAndReporting(row)"
          v-if="row.catchDataType === 5"
          :disabled="row.catchStatus === 1"
        >采集上报</vxe-button>
<!--        :disabled="row.catchStatus === 1"-->
      </template>
    </vxe-column>
  </vxe-table>

  <a-drawer
    v-model:open="isShow"
    title="采集上报"
    placement="top"
    @close="close"
  >
    <process-configuration-operation
      :id="id"
      :opsetDetailId="opsetDetailId"
      :workstationMessage="workstationMessage"
      :sheetMessage="sheetMessage"
      :selectedRow="selectedRow"
      :datas="selectedRow?.paramStandards"
      :taskCode="selectedRow?.catchCode"
      @close="close"
    />
  </a-drawer>
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
:deep(.error) {
  background: #f70000;
  color: white;
}
</style>
