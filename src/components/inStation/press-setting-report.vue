<script setup lang="ts">

import { onMounted, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  getCxMaterialListByWorksheetCode,
  getEquipCodeListByType,
  getLastEquipCodeList, getLcHistory,
  getLyEquipCodeList, lcMaterialSetReport,
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
const formData = ref<any>([])
// 是否不可编辑
const notEdit = ref(false);

function addLine() {
  formData.value.push({});
}

function delRow(index: number) {
  Modal.confirm({
    title: '操作确认',
    content: '是否确认删除该条数据?',
    onOk() {
      formData.value.splice(index, 1);
    },
    onCancel() {
      message.warning('已取消!');
    },
    class: 'test',
  });
}

const submitLoading = ref(false);
/**
 * 流转开始
 */
function submit() {
  formRef.value
    .validate().then(() => {
      const params: any = [];
      submitLoading.value = true;
      formData.value.forEach((item: any) => {
        params.push({
          worksheetCode: prop.sheetMessage?.workSheetCode,
          formEquipCode: item.formEquipCode,
          destEquipCode: item.destEquipCode,
          productCode: item.materialCode,
          bindingId: prop.id,
          opUser: localStorage.username,
        });
      })

      lcMaterialSetReport(params).then(({ data: {code, data, msg}}) => {
        if (code == 200) {
          message.success(`操作成功!`);
          formRef.value.resetFields();
          formData.value = [];
          queryLog();
        } else {
          message.error(`操作失败请联系管理员${msg}`)
        }
      }).catch((err) => {
        message.error(`操作失败请联系管理员${err}`)
      }).finally(() => {
        submitLoading.value = false;
      })
  });
}

// endregion

// region 料号

const itemNumber = ref<any>([]);

function queryCxMaterialListByWorksheetCode() {
  getCxMaterialListByWorksheetCode({
    worksheetCode: prop.sheetMessage?.workSheetCode
  }).then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
      itemNumber.value = data;
    } else {
      message.error(`操作失败请联系管理员${msg}`)
    }
  })
}
// endregion

// region 设备
/**
 * 查询来源设备
 */
function querySourceDevice(item: any) {
  item.sourceLoading = true;
  getLyEquipCodeList({
    materialCode: item.materialCode,
    worksheetCode: prop.sheetMessage?.workSheetCode,
    bindingId: prop.id,
    areaCode: '',
  }).then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
      item.sourceDevice = data;
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,
    })
  }).finally(() => {
    item.sourceLoading = false;
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

// region 历史记录查询
const logArr = ref<any[]>([]);
function queryLog() {
  getLcHistory({
    worksheetCode: prop.sheetMessage?.workSheetCode,
    bindingId: prop.id,
  }).then(({ data: {code, data, msg}}) => {
    if (code == 200) {
      logArr.value = data;
    } else {
      message.error(`操作失败请联系管理员${msg}`)
    }
  });
}

// endregion

// region 初始化

onMounted(() => {
  formData.value.push({})
  getTargetDevice();
  queryLog();
  queryCxMaterialListByWorksheetCode();
})

// endregion
</script>

<template>
  <a-form
    ref="formRef"
    :model="formData"
    :label-col="{ span: 24 }"
    :wrapper-col="{ span: 24 }"
  >
      <a-row v-for="(item, index) of formData" :key="index" class="width: 100%;">
        <a-col :span="6">
          <a-form-item
            label="料号"
            :name="[index, 'materialCode']"
            :rules="{
              required: true,
              message: '该项为必填项'
            }"
          >
            <a-select :disabled="notEdit" v-model:value="item.materialCode" @change="querySourceDevice(item)" show-search style="width: 90%">
              <a-select-option v-for="(item) of itemNumber" :key="item" :value="item.materialCode">
                {{ item.materialCode }}({{item.materialName}})
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item
            label="来源设备"
            :name="[index, 'formEquipCode']"
            :rules="{
        required: true,
        message: '该项为必填项'
      }"
          >
            <a-select :disabled="notEdit" v-model:value="item.formEquipCode" show-search style="width: 90%" :loading="item.sourceLoading">
              <a-select-option v-for="(i) of item.sourceDevice" :key="i" :value="i.equipCode">
                {{ i.equipName }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item
            label="目标设备"
            :name="[index, 'destEquipCode']"
            :rules="{
            required: true,
            message: '该项为必填项'
          }"
          >
            <a-select :disabled="notEdit" v-model:value="item.destEquipCode" show-search style="width: 90%">
              <a-select-option v-for="(item) of targetDevice" :key="item" :value="item.equipmentCode">
                {{ item.equipmentName }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-button type="primary" danger @click="delRow(index)" style=" margin-top: 2.8em;"> 删除</a-button>
        </a-col>
      </a-row>
  </a-form>
  <div style="float: right;text-align: right">
    <a-button type="primary" @click="addLine()" style="width: 200px;margin-right: 1em;">新增</a-button>
    <a-button type="primary" @click="submit()" style="width: 200px;margin-right: 1em;" :disabled="formData.length === 0" :loading="submitLoading">上传</a-button>
  </div>


  <a-timeline style="margin-top: 8em;">
    <a-timeline-item
      v-for="item of logArr"
      :key="item.id"
      color="green"
    >
      <a-descriptions bordered>
        <a-descriptions-item label="工单号">{{ item.worksheetCode }}</a-descriptions-item>
        <a-descriptions-item label="来源库位">{{ item.formEquipCode }}</a-descriptions-item>
        <a-descriptions-item label="目标库位">{{ item.destEquipCode }}</a-descriptions-item>
        <a-descriptions-item label="料号">{{ item.materialCode }}</a-descriptions-item>
        <a-descriptions-item label="操作人">{{ item.opUser }}</a-descriptions-item>
        <a-descriptions-item label="操作时间">{{ item.opTime }}</a-descriptions-item>
      </a-descriptions>
    </a-timeline-item>
  </a-timeline>
</template>

<style scoped lang="scss">

</style>
