<script setup lang="ts">

import { onMounted, ref } from 'vue'
import { getEquipCodeListByType, processRecordReport } from '@/services/in-station.service'
import { message } from 'ant-design-vue'

const prop = defineProps({
  id: {
    type: Number,
    required: true,
  },
  opsetDetailId: {
    type: Number,
    required: true,
  },
  equipt: {
    type: Array<Object>,
    required: false,
    default: [] as any[]
  },
  sheetMessage: {
    type: Object,
    required: false,
    default: {} as any
  }
});
// 表单
const formRef = ref<any>();
//  表单数据
const formState = ref<any>({});
// 是否不可编辑
const notEdit = ref(false);


// 工序操作
function processOperation(type: number) {
  formRef.value.validate().then(() => {
    processRecordReport({
      worksheetCode: prop.sheetMessage?.workSheetCode,
      equipCode: formState.value.equipCode,
      opType: type,
      bindingId: prop.id,
      batchCode: formState.value.batchCode,
      opTime: new Date(),
      opUser: localStorage.username,
    }).then(({ data: {code, data, msg} }: any) => {
      if (code == 200) {
        message.success('操作成功')
        if (type === 1) {
          formState.value.batchCode = data;
          notEdit.value = true;
          localStorage.setItem(`notEditt_course${prop.opsetDetailId}`, '1');
          localStorage.setItem(`formData${prop.opsetDetailId}`, JSON.stringify(formState.value));
        } else {
          formState.value = {};
          notEdit.value = false;
          localStorage.removeItem(`notEditt_course${prop.opsetDetailId}`);
          localStorage.removeItem(`formData${prop.opsetDetailId}`);
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
    });
  });
}

// region 设备
const targetDevice = ref<any>([]);

/**
 * 查询目标设备
 */
function getTargetDevice() {
  getEquipCodeListByType(prop.sheetMessage?.workSheetCode, prop.id, 1).then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
      targetDevice.value = data;
    } else {
      message.error({
        content: `操作失败请联系管理员${msg}`,

      })
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
  });
}

// endregion


onMounted(() => {
  getTargetDevice();
  notEdit.value = localStorage.getItem(`notEditt_course${prop.opsetDetailId}`) === '1';
  if (localStorage.getItem(`formData${prop.opsetDetailId}`)) {
    console.log(JSON.parse(localStorage.getItem(`formData${prop.opsetDetailId}`) as string))
    formState.value = JSON.parse(localStorage.getItem(`formData${prop.opsetDetailId}`) as string);
  }
});

</script>

<template>
  <a-form
    :model="formState"
    name="basic"
    ref="formRef"
    :label-col="{ span: 6 }"
    :wrapper-col="{ span: 16 }"
    autocomplete="off"
  >
    <a-row>
      <a-col :sm="24" :xl="12">
        <a-form-item
          label="所属设备"
          name="equipCode"
          :rules="[{ required: true, message: '该项为必填项!' }]"
        >
          <a-select :disabled="notEdit" v-model:value="formState.equipCode" show-search style="width: 320px">
            <a-select-option v-for="(item) of targetDevice" :key="item" :value="item.equipmentCode">
              {{ item.equipmentName }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :sm="24" :xl="12">
        <a-form-item
          label="批次号"
          name="batchCode"
        >
          <a-input :disabled="true" v-model:value="formState.batchCode" />
        </a-form-item>
      </a-col>
      <a-col :span="24">
          <a-button :disabled="notEdit" type="primary" style="float:left;" @click="processOperation(1)">工序开始</a-button>
          <a-button :disabled="!notEdit" type="primary" style="float:right;" @click="processOperation(2)">工序结束</a-button>
      </a-col>
    </a-row>
  </a-form>
</template>

<style scoped lang="scss">

</style>
