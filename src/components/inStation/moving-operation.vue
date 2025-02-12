<script setup lang="ts">

import { onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  getEquipCodeListByType,
  getLastEquipCodeList,
  getTurnRecordByParam,
  turnRecordReport
} from '@/services/in-station.service'

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
// 表单数据
const formData = ref<any>({})
// 操作类型
const opType = ref<number>(-1);
// 是否不可编辑
const notEdit = ref(false);
/**
 * 流转开始
 */
function submit() {
  const param = {
    ...formData.value,
    worksheetCode: prop.sheetMessage?.workSheetCode,
    bindingId: prop.id,
    opType: opType.value,
    opTime: new Date(),
    opUser: localStorage.username,
  }
  turnRecordReport(param).then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
      message.success(`操作成功!`);
      console.log(prop.opsetDetailId);
      if (opType.value === 1) {
        formData.value.batchCode = data;
        notEdit.value = true;
      } else {
        formData.value = {};
        notEdit.value = false;
      }

    } else {
      message.error(`操作失败请联系管理员${msg}`)
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
  });
}

// endregion

// region 设备
const sourceDevice = ref<any[]>([]);
/**
 * 查询来源设备
 */
function querySourceDevice() {
  getLastEquipCodeList(prop.sheetMessage?.workSheetCode, prop.id).then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
      sourceDevice.value = data;
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
  });
}

const targetDevice = ref<any>([]);

/**
 * 查询目标设备
 */
function getTargetDevice() {
  getEquipCodeListByType(prop.sheetMessage?.workSheetCode, prop.id, 2).then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
      targetDevice.value = data;
    } else {
      message.error(`操作失败请联系管理员${msg}`)
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
  });
}

// endregion

// region 初始化

/**
 * 查询最新的操作记录
 */
function queryLog() {
  getTurnRecordByParam(prop.sheetMessage?.workSheetCode, prop.id).then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
      if (!data.endTime) {
        formData.value = data;
        formData.value.turnNumber_T = formData.value.turnNumber / 1000;
        notEdit.value = true;
      }
    }
  })
}

onMounted(() => {
  querySourceDevice();
  getTargetDevice();
  queryLog();
})

// endregion
</script>

<template>
  <a-form
    ref="formRef"
    :model="formData"
    :label-col="{ span: 6 }"
    :wrapper-col="{ span: 16 }"
    @finish="submit"
  >
    <a-form-item
      label="来源设备"
      name="formEquipCode"
      :rules="{
        required: true,
        message: '该项为必填项'
      }"
    >
      <a-select :disabled="notEdit" v-model:value="formData.formEquipCode" show-search style="width: 320px">
        <a-select-option v-for="(item) of sourceDevice" :key="item" :value="item.equipmentCode">
          {{ item.equipmentName }}
        </a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item
      label="目标设备"
      name="destEquipCode"
      :rules="{
        required: true,
        message: '该项为必填项'
      }"
    >
      <a-select :disabled="notEdit" v-model:value="formData.destEquipCode" show-search style="width: 320px">
        <a-select-option v-for="(item) of targetDevice" :key="item" :value="item.equipmentCode">
          {{ item.equipmentName }}
        </a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item
      label="流转数量"
      name="turnNumber"
      :rules="{
        required: true,
        message: '该项为必填项'
      }"
    >
      <a-input-number
        v-model:value="formData.turnNumber"
        :disabled="notEdit"
        :addon-after="unitMessage"
        :min="0"
        :style="
        {
          margin: unitMessage === 'KG' ? '0 1em 1em 0' : '0',
        }"
        @Change="() => {
          formData.turnNumber_T = formData.turnNumber / 1000;
        }"
      />
      <a-input-number
        v-model:value="formData.turnNumber_T"
        :disabled="notEdit"
        addon-after="T"
        :min="0"
        v-if="unitMessage === 'KG'"
        @Change="() => {
          formData.turnNumber = formData.turnNumber_T * 1000;
        }"
      />

    </a-form-item>

    <a-form-item
      label="流转批次"
      name="batchCode"
    >
      <!--      :rules="{
            required: true,
            message: '该项为必填项'
            }"-->
      <a-input
        v-model:value="formData.batchCode"
        :disabled="true"
      />
    </a-form-item>

    <a-form-item :wrapper-col="{span: 24}">
      <a-button :disabled="notEdit" type="primary" html-type="submit" style="float:left;" @click="() => {opType = 1}">流转开始</a-button>
      <a-button :disabled="!notEdit" type="primary" html-type="submit" style="float:right;" @click="() => {opType = 2}">流转结束</a-button>
    </a-form-item>
  </a-form>
</template>

<style scoped lang="scss">

</style>
