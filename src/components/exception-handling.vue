<script setup lang="ts">

// region 查询数据

import { onMounted, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'

// 异常数据
const abnormalData = ref<any>([
  {
    "defectiveQRCode": "ABCD12345678",
    "workOrderNumber": "GD20240929001",
    "productNumber": "PROD456789",
    "status": "待处理"
  },
  {
    "defectiveQRCode": "EFGH67890123",
    "workOrderNumber": "GD20240929002",
    "productNumber": "PROD567890",
    "status": "待处理"
  },
  {
    "defectiveQRCode": "IJKL23456789",
    "workOrderNumber": "GD20240929003",
    "productNumber": "PROD678901",
    "status": "待处理"
  },
  {
    "defectiveQRCode": "MNOP45678901",
    "workOrderNumber": "GD20240929004",
    "productNumber": "PROD789012",
    "status": "待处理"
  },
  {
    "defectiveQRCode": "QRST89012345",
    "workOrderNumber": "GD20240929005",
    "productNumber": "PROD890123",
    "status": "待处理"
  }
]);


// 物料数据列表
const materialInformation = ref([
  {
    'MaterialID': '00021',
    'MaterialName': '高纯度硅胶',
    'MaterialTag': '20240907WL000210001',
    'CurrentWeight': 800,
    'RemainingWeight': 750,
    'SamplingBatchNumber': 'SAMPLE20240907',
    'InspectionOrderNumber': 'IO20240907001', // 修改后的检验单号
    'InspectionResult': {
      'value': '合格',
      'resultStatus': 'success'
    }
  },
  {
    'MaterialID': '00047',
    'MaterialName': '不锈钢板材',
    'MaterialTag': '20240907WL000470002',
    'CurrentWeight': 200,
    'RemainingWeight': 190,
    'SamplingBatchNumber': 'SAMPLE20240907',
    'InspectionOrderNumber': 'IO20240907002', // 修改后的检验单号
    'InspectionResult': {
      'value': '合格',
      'resultStatus': 'success'
    }
  },
  {
    'MaterialID': '00073',
    'MaterialName': '高强度尼龙',
    'MaterialTag': '20240907WL000730003',
    'CurrentWeight': 500,
    'RemainingWeight': 480,
    'SamplingBatchNumber': 'SAMPLE20240907',
    'InspectionOrderNumber': 'IO20240907003', // 修改后的检验单号
    'InspectionResult': {
      'value': '合格',
      'resultStatus': 'success'
    }
  },
  {
    'MaterialID': '00099',
    'MaterialName': '聚氯乙烯树脂',
    'MaterialTag': '20240907WL000990004',
    'CurrentWeight': 120,
    'RemainingWeight': 115,
    'SamplingBatchNumber': 'SAMPLE20240907',
    'InspectionOrderNumber': 'IO20240907004', // 修改后的检验单号
    'InspectionResult': {
      'value': '合格',
      'resultStatus': 'success'
    }
  },
  {
    'MaterialID': '00125',
    'MaterialName': '钛合金棒材',
    'MaterialTag': '20240907WL001250005',
    'CurrentWeight': 300,
    'RemainingWeight': 290,
    'SamplingBatchNumber': 'SAMPLE20240907',
    'InspectionOrderNumber': 'IO20240907005', // 修改后的检验单号
    'InspectionResult': {
      'value': '合格',
      'resultStatus': 'success'
    }
  }
] as any)
// 选中的物料下标
const selectedMaterial = ref<any>()

// endregion

// region 表格操作

/**
 * 报废处理
 */
function scrap(row: any) {
  Modal.confirm({
    title: '操作确认',
    content: '是否确认报废该条数据?',
    onOk() {
      row.status = '报废';
      message.success('操作成功!');
      localStorage.abnormalData = JSON.stringify(abnormalData.value)
    },
    onCancel() {
      message.warning('已取消!');
    },
    class: 'test',
  });
}

// 返工数据
const reworkData = ref<any>({});
// 返工抽屉是否显示
const reworkOpen = ref(false)
// 工序列表
const processArr = ref<any>([
  {
    "processCode": "PC001",
    "processName": "焊接",
    "machineNumber": "MN001",
    "status": "合格"
  },
  {
    "processCode": "PC002",
    "processName": "涂装",
    "machineNumber": "MN002",
    "status": "异常"
  },
  {
    "processCode": "PC003",
    "processName": "组装",
    "machineNumber": "MN003",
    "status": "合格"
  },
  {
    "processCode": "PC004",
    "processName": "检测",
    "machineNumber": "MN004",
    "status": "异常"
  },
  {
    "processCode": "PC005",
    "processName": "包装",
    "machineNumber": "MN005",
    "status": "合格"
  }
]);
// 工序列表
const processArrCopy = ref<any>([]);
// 是否处于查看模式
const isView = ref(false);
/**
 * 返工
 * @param row
 * @param view 是否处于查看模式
 */
function rework(row: any, view?: boolean) {
  reworkOpen.value = true;
  reworkData.value = row;
  processArrCopy.value = processArr.value;
  isView.value = !!view;
}

function reworkSubmit() {
  let reworkOrNot = false;
  for (const item of processArrCopy.value) {
    if (item.returnResult == '返工') {
      reworkOrNot = true;
    } else {
      reworkOrNot = false;
      continue;
    }
  }
  if (reworkOrNot) {
    reworkData.value.status = '返工';
    message.success('操作成功!')
    reworkOpen.value = false
    localStorage.abnormalData = JSON.stringify(abnormalData.value)
  }
  // returnResult
}

// endregion
onMounted(() => {

  if (localStorage.abnormalData) {
    abnormalData.value = JSON.parse(localStorage.abnormalData)
  }
})
</script>

<template>
  <a-space :size="20" direction="vertical">
    <a-card style="margin-top: 2em;width: calc(100vw - 250px);">
      <a-descriptions :column="2" bordered>
        <a-descriptions-item :span="2" label="工单号">
          <a-select v-model:value="selectedMaterial"  show-search style="width: 320px">
            <a-select-option v-for="(item) of materialInformation" :key="item.MaterialID" :value="item.MaterialTag">
              {{ item.MaterialTag }}
            </a-select-option>
          </a-select>
        </a-descriptions-item>
      </a-descriptions>
    </a-card>
    <a-card style="width: calc(100vw - 250px);">
      <vxe-table
        :data="(selectedMaterial || selectedMaterial == 0) ?abnormalData : []"
        header-cell-class-name="table_head"
        header-align="center"
        align="center"
        height="300"
      >
        <vxe-column type="seq" width="60"></vxe-column>
        <vxe-column field="defectiveQRCode" min-width="220" title="不良品二维码"></vxe-column>
        <vxe-column field="workOrderNumber" min-width="220" title="工单号"></vxe-column>
        <vxe-column field="productNumber" min-width="220" title="产品号"></vxe-column>
        <vxe-column field="status" min-width="220" title="状态"></vxe-column>
        <vxe-column field="createTime" min-width="220" fixed="right" title="操作">
          <template #default="{row}">
            <div v-if="row.status === '待处理'">
              <a-button type="link" @click="rework(row)" >返工</a-button>
              <a-button type="link" danger @click="scrap(row)">报废</a-button>
            </div>
            <div v-if="row.status === '返工'">
              <a-button type="link" @click="rework(row)" >返工配置</a-button>
              <a-button type="link" @click="rework(row, true)">返工查看</a-button>
            </div>
          </template>
        </vxe-column>
      </vxe-table>
    </a-card>
  </a-space>

  <!-- 投料信息 -->
  <a-drawer
    v-model:open="reworkOpen"
    :footer-style="{ textAlign: 'right' }"
    class="custom-class"
    placement="top"
    title="投料信息"
    height="650"
  >
    <a-descriptions :column="3" bordered>
      <a-descriptions-item label="产品二维码">
        {{reworkData.defectiveQRCode}}
      </a-descriptions-item>
      <a-descriptions-item label="工单号">
        {{reworkData.workOrderNumber}}
      </a-descriptions-item>
      <a-descriptions-item label="产品号">
        {{reworkData.productNumber}}
      </a-descriptions-item>
    </a-descriptions>
    &nbsp;
    <vxe-table
      :data="processArrCopy"
      header-cell-class-name="table_head"
      header-align="center"
      align="center"
      height="300"
    >
      <vxe-column type="seq" width="60"></vxe-column>
      <vxe-column field="processCode" min-width="220" title="工序编号"></vxe-column>
      <vxe-column field="processName" min-width="220" title="工序名称"></vxe-column>
      <vxe-column field="machineNumber" min-width="220" title="对应机台"></vxe-column>
      <vxe-column field="status" min-width="220" title="状态"></vxe-column>
      <vxe-column field="createTime" min-width="180" fixed="right" title="是否返工">
        <template #default="{row}">
          <a-radio-group v-model:value="row.returnResult" name="radioGroup" :disabled="isView">
            <a-radio value="返工">返工</a-radio>
            <a-radio value="不返工">不返工</a-radio>
          </a-radio-group>
        </template>
      </vxe-column>
    </vxe-table>

    <template #footer v-if="!isView">
      <a-button style="margin-right: 8px" @click="reworkOpen = false">取消</a-button>
      <a-button type="primary" @click="reworkSubmit">提交</a-button>
    </template>
  </a-drawer>
</template>

<style scoped lang="scss">

</style>
