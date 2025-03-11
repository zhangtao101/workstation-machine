<script setup lang="ts">

import { onMounted, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  getBatchListByWorksheetCode,
  getMaterials, listWordListByParentCode,
  materialDBApply,
  materialFXApply
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
  }
});

// region 领料
// 待选择的物料列表
const materialArr = ref<any[]>([]);
// 领用的材料列表
const listOfMaterials = ref<any[]>([]);
// 表单对象
const formRef = ref();

/**
 * 添加一行
 */
function addLine() {
  listOfMaterials.value.push({ });
}

/**
 * 删除一行
 * @param index
 */
function delLine(index: number) {
  Modal.confirm({
    title: '操作确认',
    content: '是否确认删除该条数据?',
    onOk() {
      listOfMaterials.value.splice(index, 1);
    },
    onCancel() {
      message.warning('已取消!');
    },
    class: 'test',
  });
}

/**
 * 选项改变
 * @param formItem form元素
 */
function selectedChange(formItem: any) {
  return (_value: string, _item_selecte: any) => {
    formItem.selected = _item_selecte;
  }
}

// 过滤
const filterOption = (input: string, option: any) => {
  return option.materialCode.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
    option.materialName.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};
// 过滤
const filterOption2 = (input: string, option: any) => {
  return option.wordName.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
    option.wordName.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};

const numberChange =  async (_rule: any, value: number) => {
  return value >= 0 ? Promise.resolve() : Promise.reject('');
}
const submitLoading = ref(false);
/**
 * 领料
 */
function getMaterialsFun() {
  const params = [...listOfMaterials.value];
  let isSuccess = true;
  params.forEach(item => {
    item.worksheetCode = prop.sheetMessage?.workSheetCode;
    item.bindingId = prop.id;
    item.applyUser = localStorage.getItem('username');
    if (item.brokenNumber + item.applyNumber > item.selected?.stockQuality) {
      message.error('数量+破碎数量 不能大于可上砖数量');
      isSuccess = false;
    }
  });
  if (isSuccess) {
    submitLoading.value = true;
    let ob: any;
    if (prop.workstationMessage?.workstationName.includes('抛光')) {
      ob = getMaterials(params);
    }
    else if (prop.workstationMessage?.workstationName.includes('打包')) {
      ob = materialDBApply(params);
    }
    else if (prop.workstationMessage?.workstationName.includes('复选')) {
      ob = materialFXApply(params);
    }
    else {
      message.warning('当前没有具体的接口, 请联系相关人员!')
      submitLoading.value = false;
      return;
    }
    ob?.then(({ data: {code, data, msg} }: any) => {
      if (code == 200) {
        message.success('操作成功')
        init();
        listOfMaterials.value = [];
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
}

// endregion

/**
 * 初始化
 */
function init() {
  getBatchListByWorksheetCode(prop.sheetMessage?.workSheetCode).then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
      data.forEach((item: any) => {
        item.NameAndCode = `${item.labelCode}(${item.productName})`;
      });
      materialArr.value = data;
    } else {
      message.error(`操作失败请联系管理员${msg}`)
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
  });
  getWordListByParentCode();
}

const wordList = ref([]);
function getWordListByParentCode() {
  listWordListByParentCode().then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
      wordList.value = data;
    }
  });
}

onMounted(() => {
  init();
})

</script>

<template>
  <a-button type="primary" @click="addLine()">
    添加
  </a-button>
  <a-form
    ref="formRef"
    :model="listOfMaterials"
    :label-col="{ span: 8 }"
    :wrapper-col="{ span: 16 }"
    @finish="getMaterialsFun"
  >
    <a-space direction="vertical" style="width: 100%;margin-top: 1em;">
      <template v-for="(item, index) of listOfMaterials" :key="item.id">
        <a-card>
          <a-form-item
            label="砖坯类型"
            :name="[index, 'productPtTypeCode']"
            :rules="{
              required: true,
              message: '该项为必填项',
            }"
          >
            <a-select
              v-model:value="listOfMaterials[index].productPtTypeCode"
              :field-names="{ label: 'wordName', value: 'wordCode' }"
              :filter-option="filterOption2"
              :options="wordList"
            />
          </a-form-item>
          <a-form-item
            label="领用批号"
            :name="[index, 'batchCode']"
            :rules="{
              required: true,
              message: '该项为必填项',
            }"
          >
            <a-select
              v-model:value="listOfMaterials[index].batchCode"
              :field-names="{ label: 'NameAndCode', value: 'labelCode' }"
              :filter-option="filterOption"
              :options="materialArr"
              @change="(_value: string, _item_selecte: any) => selectedChange(item)(_value, _item_selecte)"
            />
          </a-form-item>
          <a-form-item label="砖坯批号">
            {{ item.selected?.labelCode }}
          </a-form-item>
          <a-form-item label="产品编号">
            {{ item.selected?.productCode }}
          </a-form-item>
          <a-form-item label="可上砖数量">
            {{ item.selected?.stockQuality }}
          </a-form-item>
          <a-form-item
            label="数量"
            :name="[index, 'applyNumber']"
            :rules="{
              required: true,
              message: '该项为必填项',
              validator: numberChange
            }"
          >
            <a-input-number
              v-model:value="listOfMaterials[index].applyNumber"
              :max="item.selected?.stockQuality"
              :min="0"
              @change="listOfMaterials[index].brokenNumber = 0;"
            />
          </a-form-item>
          <a-form-item
            label="破碎数量"
            :name="[index, 'brokenNumber']"
            :rules="{
              required: true,
              message: '该项为必填项',
              validator: numberChange
            }"
          >
            <a-input-number
              v-model:value="listOfMaterials[index].brokenNumber"
              :max="item.selected?.stockQuality"
              :min="0"
            />
          </a-form-item>
          <a-form-item label="" :wrapper-col="{offset: 8}">
            <a-button type="primary" danger @click="delLine(index)" style="width: 100%;">
              删除
            </a-button>
          </a-form-item>
        </a-card>
      </template>
      <a-button type="primary" html-type="submit" :disabled="listOfMaterials.length === 0" :loading="submitLoading" style="width: 100%;">
        领料
      </a-button>
    </a-space>
  </a-form>

</template>

<style scoped lang="scss">

</style>
