<script setup lang="ts">

import { h, onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  getMaterialCodeByWarehouseCode,
  getWarehouseListByStationCode,
  getYlzyWarehouseCodeList, turnMaterialRecordReport,
  turnRecordReport
} from '@/services/in-station.service'
import { DeleteOutlined, EditOutlined, RetweetOutlined } from '@ant-design/icons-vue'

// region 移动

const formRef = ref();
// 表单数据
const formData = ref<any>({})
/**
 * 流转开始
 */
function submit() {
  const param = {
    ...formData.value,
    opTime: new Date(),
    opUser: localStorage.username,
  }
  turnMaterialRecordReport(param).then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
      message.success(`操作成功!`);
      formData.value = {};
      querySourceDevice();
      queryWarehouseList();
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
const devices = ref<any[]>([]);
/**
 * 查询来源设备
 */
function querySourceDevice() {
  getYlzyWarehouseCodeList(localStorage.getItem('equipmentCode')).then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
      devices.value = data;
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
  });
}

// endregion

// region 库存获取
const inventory = ref<any[]>([]);
const inventoryLoading = ref(false);
function queryWarehouseList() {
  inventoryLoading.value = true;
  getWarehouseListByStationCode(localStorage.getItem('equipmentCode') || '').then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
      inventory.value = data;
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,
    })
  }).finally(() => {
    inventoryLoading.value = false;
  });
}

// endregion

// region 查询物料
// 物料列表
const materialCode = ref<any[]>([]);

function queryMaterialCode(warehouseCode: string) {
  formData.value.materialCode = undefined;
  getMaterialCodeByWarehouseCode(warehouseCode).then(({data: {code, data, msg}}) => {
    if (code == 200) {
      materialCode.value = data;
    }
  })
}

// endregion

// region 初始化

onMounted(() => {
  querySourceDevice();
  queryWarehouseList();
})

// endregion
</script>

<template>
  <a-form
    ref="formRef"
    layout="inline"
    :model="formData"
    @finish="submit"
    style="margin-top: 5em;"
  >
    <a-form-item
      label="来源库位"
      name="formEquipCode"
      style="margin-bottom: 1em;"
      :rules="{
        required: true,
        message: '该项为必填项'
      }"
    >
      <a-select v-model:value="formData.formEquipCode" show-search style="width: 320px" @change="queryMaterialCode(formData.formEquipCode)">
        <a-select-option v-for="(item) of devices" :key="item" :value="item.equipCode">
          {{ item.equipName }}
        </a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item
      label="目标库位"
      name="destEquipCode"
      style="margin-bottom: 1em;"
      :rules="{
        required: true,
        message: '该项为必填项'
      }"
    >
      <a-select v-model:value="formData.destEquipCode" show-search style="width: 320px">
        <a-select-option v-for="(item) of devices" :key="item" :value="item.equipCode">
          {{ item.equipName }}
        </a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item
      label="物料选择"
      name="materialCode"
      style="margin-bottom: 1em;"
      :rules="{
        required: true,
        message: '该项为必填项'
      }"
    >
      <a-select v-model:value="formData.materialCode" show-search style="width: 320px">
        <a-select-option v-for="(item) of materialCode" :key="item" :value="item.materialCode">
          {{ item.materialCode }}({{item.materialName}})___{{item.stockQuality }}({{item.unit}})
        </a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item
      label="流转数量"
      name="turnNumber"
      style="margin-bottom: 1em;"
      :rules="{
        required: true,
        message: '该项为必填项'
      }"
    >
      <a-input-number
        v-model:value="formData.turnNumber"
        addon-after="KG"
        style="margin-right: 1em;"
        :min="0"
        @Change="() => {
          formData.turnNumber_T = formData.turnNumber / 1000;
        }"
      />
      <a-input-number
        v-model:value="formData.turnNumber_T"
        addon-after="T"
        :min="0"
        @Change="() => {
          formData.turnNumber = formData.turnNumber_T * 1000;
        }"
      />

    </a-form-item>


    <a-form-item style="margin-bottom: 1em;">
      <a-button type="primary" html-type="submit" style="float:left;" >物料移动</a-button>
    </a-form-item>
  </a-form>

  <vxe-table
    :data="inventory"
    :loading="inventoryLoading"
    height="50%"
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

</style>
