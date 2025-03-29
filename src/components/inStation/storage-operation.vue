<script setup lang="ts">

import { onMounted, ref } from 'vue'
import { getWorksheetByCode } from '@/services/workstation.service'
import { message } from 'ant-design-vue'
import {
  getEquipCodeListByType, getInWarehouseHistory,
  getMaterials,
  getPackageInWarehouseList,
  getWarehouseCodeList,
  materialDBApply,
  materialFXApply, worksheetBCP1InWarehouse,
  worksheetBCPInWarehouse,
  worksheetDBInWarehouse,
  worksheetFXInWarehouse,
  worksheetInWarehouse
} from '@/services/in-station.service'
import { getProductByWorksheetAndBindingId } from '@/services/machine-summary.service'

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
  unitMessage: {
    type: String,
    required: false,
    default: ''
  },
});

// region 入库

const formRef = ref();
// 入库表单数据
const storageEntryForm = ref<any>({})
// 工单类型
const processType = ref<number>(-1);
// 加载状态
const submitLoading = ref(false);

/**
 * 入库
 */
function submit() {
  const param = {
    ...storageEntryForm.value,
    worksheetCode: prop.sheetMessage?.workSheetCode,
    bindingId: prop.id,
    inUser: localStorage.username,
  }
  submitLoading.value = true;
  let ob: any;
  if (
    prop.workstationMessage?.workstationName.includes('制浆') ||
    prop.workstationMessage?.workstationName.includes('制色') ||
    prop.workstationMessage?.workstationName.includes('制粉') ||
    prop.workstationMessage?.workstationName.includes('制釉')
  ) {
    ob = worksheetInWarehouse(param)
  }
  else if (prop.workstationMessage?.workstationName.includes('烧成')) {
    ob = worksheetBCPInWarehouse(param);
  }
  else if (prop.workstationMessage?.workstationName.includes('打包')) {
    ob = worksheetDBInWarehouse(param);
  }
  else if (prop.workstationMessage?.workstationName.includes('复选')) {
    ob = worksheetFXInWarehouse(param);
  }
  else if (prop.workstationMessage?.workstationName.includes('卧干')) {
    ob = worksheetBCP1InWarehouse(param);
  }
  else {
    message.warning('当前没有具体的接口, 请联系相关人员!')
    submitLoading.value = false;
    return;
  }
  ob?.then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
      message.success(`操作成功!`);
      formRef.value.resetFields();
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
}

// endregion

// region 初始化
// 面积系数
const squareCoefficient = ref(1);
function init() {
  if (prop.sheetMessage){
    getWorksheetByCode(prop.sheetMessage.workSheetCode).then(({ data: {code, data, msg} }: any) => {
      if (code == 200) {
        processType.value = data.processType;
      } else {
        message.error(`操作失败请联系管理员${msg}`)
      }
    }).catch((err) => {
      message.error({
        content: `操作失败请联系管理员,${err.message ? err.message : err}`,
      })
    });
  }
  if (prop.unitMessage === '片') {
    getProductByWorksheetAndBindingId({
      worksheetCode: prop.sheetMessage?.workSheetCode
    })
      .then(({ data: { code, data, msg } }: any) => {
        if (code == 200) {
          squareCoefficient.value = data[0].conversionFaction ?? 1
        }
      })
      .catch((err) => {
        message.error({
          content: `操作失败请联系管理员,${err.message ? err.message : err}`
        })
      })
  }
}

// region 获取库位
const warehouseCodeList = ref<any>([]);
const warehouseCodeListLoading = ref<any>(false);
function getWarehouseCodeLists(val: string) {
  warehouseCodeListLoading.value = true;
  getWarehouseCodeList({
    workstationCode: prop.workstationMessage?.workstationCode,
    worksheetCode: prop.sheetMessage?.workSheetCode,
    bindingId: prop.id,
    areaCode: val
  }).then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
      warehouseCodeList.value = [];
      data.forEach((item: any) => {
        warehouseCodeList.value.push({
          label: item.equipName,
          value: item.equipCode
        })
      })
    } else {
      message.error(`操作失败请联系管理员${msg}`)
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
  }).finally(() => {
    warehouseCodeListLoading.value = false;
  });
}
// endregion

/**
 * 获取类型
 */
function getTypeNumber() {
  if (prop.workstationMessage?.workstationCode.includes('ZJ')) {
    return 1;
  }
  else if (prop.workstationMessage?.workstationCode.includes('ZF')) {
    return 4;
  }
  else if (prop.workstationMessage?.workstationCode.includes('ZY')) {
    return 3;
  }
  else if (prop.workstationMessage?.workstationCode.includes('CX')) {
    return 5
  }
  else if (prop.workstationMessage?.workstationCode.includes('WG')) {
    return 5;
  }
  else if (prop.workstationMessage?.workstationCode.includes('SY')) {
    return 12;
  }
  else if (prop.workstationMessage?.workstationCode.includes('SC')) {
    return 12;
  }
  else if (prop.workstationMessage?.workstationCode.includes('PG')) {
    return 6;
  }
  return -1;
}

// region 获取批次

const batchCodeList = ref<any>([]);
const batchCodeListLoading = ref<any>(false);
function getBatchCodeList(val: string) {
  batchCodeListLoading.value = true;
  getPackageInWarehouseList({
    worksheetCode: prop.sheetMessage?.workSheetCode,
  }).then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
      batchCodeList.value = [];
      data.forEach((item: any) => {
        batchCodeList.value.push({
          label: `${item.productName}(${item.batchCode})-${item.batchNumber}`,
          value: item.batchCode
        })
      })
    } else {
      message.error(`操作失败请联系管理员${msg}`)
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
  }).finally(() => {
    batchCodeListLoading.value = false;
  });
}

// endregion

/**
 * 查询目标设备
 */
function getTargetDevice() {
  warehouseCodeListLoading.value = true;
  getEquipCodeListByType(prop.sheetMessage?.workSheetCode, prop.id, 1).then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
      warehouseCodeList.value = [];
      data.forEach((item: any) => {
        warehouseCodeList.value.push({
          label: item.equipmentName,
          value: item.equipmentCode
        })
      });
    } else {
      message.error(`操作失败请联系管理员${msg}`)
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
  }).finally(() => {
    warehouseCodeListLoading.value = false;
  });
}

// 历史库存
const historicalInventory = ref(0);
/**
 * 查询入库历史
 */
function queryInWarehouseHistory() {
  getInWarehouseHistory(prop.sheetMessage?.workSheetCode).then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
      historicalInventory.value = data;
    } else {
      message.error(`操作失败请联系管理员${msg}`)
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,
    })
  });
}




onMounted(() => {
  init();
  queryInWarehouseHistory();
  if (prop.workstationMessage?.workstationName.includes('制粉')) {
    getTargetDevice()
  } else if (prop.workstationMessage?.workstationName.includes('打包')) {
    getBatchCodeList('');
  } else {
    getWarehouseCodeLists('');
  }
})

// endregion
</script>

<template>
  <a-form
    ref="formRef"
    :model="storageEntryForm"
    :label-col="{ span: 6 }"
    :wrapper-col="{ span: 16 }"
    @finish="submit"
  >
    <a-form-item
      label="库位"
      name="warehouseCode"
      :rules="{
        required: true,
        message: '该项为必填项'
      }"
      v-if="
        processType === 13 ? [7,8,10].indexOf(getTypeNumber()) == -1 : [7,8,10].indexOf(processType) == -1
      "
    >
      <a-select
        v-model:value="storageEntryForm.warehouseCode"
        show-search
        placeholder=""
        style="width: 400px"
        :options="warehouseCodeList"
        :loading="warehouseCodeListLoading"
        @search="getWarehouseCodeLists"
        v-if="!workstationMessage?.workstationName.includes('制粉')"
      >
        <template v-if="warehouseCodeListLoading" #notFoundContent>
          <a-spin size="small" />
        </template>
      </a-select>
      <a-select
        v-model:value="storageEntryForm.warehouseCode"
        show-search
        placeholder=""
        style="width: 400px"
        :options="warehouseCodeList"
        v-else
      >
        <template v-if="warehouseCodeListLoading" #notFoundContent>
          <a-spin size="small" />
        </template>
      </a-select>
    </a-form-item>
    <a-form-item
      label="批次号"
      name="batchCode"
      :rules="{
        required: true,
        message: '该项为必填项'
      }"
      v-if="
        processType === 13 ? [7,8,10,11].includes(getTypeNumber()) : [7,8,10,11].includes(processType)
      "
    >
<!--      <a-input-->
<!--        v-model:value="storageEntryForm.batchCode"-->
<!--      />-->
      <a-select
        v-model:value="storageEntryForm.batchCode"
        show-search
        placeholder=""
        style="width: 400px"
        :options="batchCodeList"
        :loading="batchCodeListLoading"
        @search="getBatchCodeList"
        v-if="!workstationMessage?.workstationName.includes('制粉')"
      >
        <template v-if="batchCodeListLoading" #notFoundContent>
          <a-spin size="small" />
        </template>
      </a-select>
    </a-form-item>
    <a-form-item
      label="已入库数量"
    >
     <span style="margin-right: 1em;"> {{historicalInventory}} {{unitMessage}}</span>
     <span v-if="unitMessage === 'KG'"> {{historicalInventory / 1000}} T</span>
     <span v-if="unitMessage === '片'"> {{historicalInventory * squareCoefficient}} ㎡</span>
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
        v-model:value="storageEntryForm.number"
        :addon-after="unitMessage"
        :min="0"
        :style="
        {
          margin: unitMessage === 'KG' ? '0 1em 1em 0' : '0',
        }"
        @Change="() => {
          storageEntryForm.number_T = (storageEntryForm.number / 1000).toFixed(3);
          storageEntryForm.qualityNumber_pf = (storageEntryForm.number * squareCoefficient).toFixed(3);
        }"
      />
      <a-input-number
        v-model:value="storageEntryForm.number_T"
        addon-after="T"
        :min="0"
        v-if="unitMessage === 'KG'"
        @Change="() => {
          storageEntryForm.number = (storageEntryForm.number_T * 1000).toFixed(3);
        }"
      />
      <a-input-number
        v-model:value="storageEntryForm.qualityNumber_pf"
        addon-after="㎡"
        :min="0"
        v-if="unitMessage === '片'"
        style="margin-left: 1em"
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
      v-if="
        processType === 13 ? [7,8,10,11].includes(getTypeNumber()) : [7,8,10,11].includes(processType)
      "
    >
      <a-input-number
        v-model:value="storageEntryForm.packageNumber"
        :min="0"
      />
    </a-form-item>
    <a-form-item label="" :wrapper-col="{offset: 6, span: 16}">
      <a-button type="primary" html-type="submit" :loading="submitLoading" style="width: 100%;">
        入库
      </a-button>
    </a-form-item>
  </a-form>
</template>

<style scoped lang="scss">

</style>
