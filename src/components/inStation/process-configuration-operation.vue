<script setup lang="ts">

import { onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import { getProductStandardList, proceParamCatch } from '@/services/process-arameter.service'

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
  },
  datas: {
    type: Array<Object>,
    required: false,
    default: [] as any
  },
  taskCode: {
    type: String,
    required: false,
    default: ''
  }
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

// region 上传
const submitLoading = ref(false);
const argumentType = ref<any[]>([
  {
    label: '数值型',
    value: 1,
  },
  {
    label: '判断型',
    value: 2,
  },
]);
/**
 * 提交
 */
function submit() {
  submitLoading.value = true;
  setTimeout(() => {
    const params: any = [];
    tableData.value.forEach((item: any) => {
      params.push({
        catchUser: localStorage.username,
        tempId: item.paramCode,
        paramName: item.paramName,
        minNum: item.minNum,
        standardNum: item.standardNumBlack,
        taskCode: prop.taskCode,
        worksheetCode: prop.sheetMessage?.workSheetCode,
        bindingId: prop.id,
      });
    });
    proceParamCatch(params).then(({ data: {code, data, msg} }: any) => {
      if (code == 200) {
        message.success('操作成功')
        if (prop.taskCode) {
          emits('close', '')
        } else {
          init();
        }
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
      submitLoading.value = false;
    });
  }, 500);
}

// endregion


// region 初始化

function init() {
  tableLoading.value = true;
  getProductStandardList({
    workstationCode: prop.workstationMessage?.workstationCode,
    worksheetCode: prop.sheetMessage?.workSheetCode,
    bindingId: prop.id,
    opsetDetailId: prop.opsetDetailId
  }).then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
      data.forEach((item: any) => {
        item.standardNumBlack = item.actParamValue ?? item.standardNum;
      });
      tableData.value = data;
    } else {
      message.error(`操作失败请联系管理员${msg}`)
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
  if (prop.taskCode) {
    tableData.value = prop.datas;
    tableData.value.forEach((item: any) => {
      item.standardNumBlack = item.actParamValue ?? item.standardNum;
    });
  } else {
    init();
  }
});

// endregion


</script>

<template>
  <vxe-table
    :data="tableData"
    :loading="tableLoading"
    :edit-config="editConfig"
    :footer-data="[{maxNum: ''}]"
    :height="300"
    show-footer
    :style="{
      'max-width': `calc(100vw - ${!taskCode ? '250px' : '0px'})`
    }"
  >
    <vxe-column type="seq" width="60"></vxe-column>
    <vxe-column field="paramCode" min-width="120" title="参数编号"></vxe-column>
    <vxe-column field="paramName" min-width="120" title="参数名称"></vxe-column>
    <vxe-column field="judgeRequirement" min-width="120" title="参数说明"></vxe-column>
    <vxe-column field="minNum" min-width="120" title="参数类型" :edit-render="{name: 'VxeSelect', options: argumentType, immediate: true}"></vxe-column>
    <vxe-column field="standardNum" min-width="120" title="工艺标准" ></vxe-column>
    <vxe-column
      field="standardNumBlack"
      min-width="120"
      :title="datas && datas.length > 0 ? '实际值' : '设置值'"
      :edit-render="{name: 'VxeNumberInput', placeholder: '请输入'}"
    ></vxe-column>
<!--    <vxe-column field="standardNumBlack" min-width="120" title="工艺调整值" :edit-render="{name: 'VxeNumberInput', placeholder: '请输入'}"></vxe-column>-->
    <vxe-column field="maxNum" min-width="120" title="阈值范围">
      <template #footer>
        <a-button type="primary" @click="submit" :loading="submitLoading">
          上传
        </a-button>
      </template>
    </vxe-column>
  </vxe-table>
</template>

<style scoped lang="scss">

</style>
