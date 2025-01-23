<script setup lang="ts">

import { onMounted, ref } from 'vue'
import { getEnergyToDoList } from '@/services/in-station.service'
import { message } from 'ant-design-vue'
import { BASE_URL } from '@/services/config'
import { UploadOutlined } from '@ant-design/icons-vue'
import {
  energyCatch,
  getEnergyEquipCodeList,
  getEnergyHisory,
  listWordListByParentCode
} from '@/services/process-arameter.service'


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
  equipCodeList: {
    type: Array<Object>,
    required: false,
    default: []
  }
});

// region 表格数据
// 表格数据
const tableData = ref<any>([]);
// 表格加载状态
const tableLoading = ref(false);

// endregion

// region 采集
// 是否显示采集对话框
const isShow = ref(false);
// 表单
const formRef = ref<any>();
const formState = ref<any>({  });
// 上传文件列表
const fileList = ref<any>([]);
// 当前活跃的key
const activeKey = ref<any>('');

// 设备选项
const selectOptions = ref<any>([]);
// 操作类型选项
const typeOptions = ref<any>([
  {
    label: '正常采集',
    value: 1
  },
  {
    label: '异常采集',
    value: -1
  },
]);

/**
 * 显示采集抽屉
 * @param row
 */
function showGatherIngredients(row: any) {
  isShow.value = true;
  formState.value = row;
  queryEquipCodeList(row);
}

/**
 * 关闭抽屉
 */
function close() {
  isShow.value = false;
  formState.value = {};
  init();
}

/**
 * 提交状态
 */
const submitLoading = ref(false);

/**
 * 提交
 */
function submit() {
  formRef.value.validate()
    .then(() => {
      const fileId: any = [];
      fileList.value.forEach(({ response: {code, data} }: any) => {
        if (code === 200) {
          fileId.push(data)
        }
      })
      submitLoading.value = true;
      energyCatch({
        ...formState.value,
        energyType: formState.value.catchDataType,
        catchUser: localStorage.username,
        fileId: fileId
      }).then(({ data: {code, data, msg} }: any) => {
        if (code == 200) {
          message.success('提交成功');
          queryLog(formState.value.energyEquipCode);
        } else {
          message.error(`操作失败请联系管理员${msg}`)
        }
      }).catch((err) => {
        message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
      }).finally(() => {
        submitLoading.value = false;
      })
    });
}
// endregion

// region 异常类型
const errorOptions = ref<any>([]);
function queryErrorCode() {
  listWordListByParentCode('NHCJYC').then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
      errorOptions.value = [];
      data.forEach((item: any) => {
        errorOptions.value.push({
          label: item.wordName,
          value: item.wordCode,
        });
      })
    } else {
      message.error(`操作失败请联系管理员${msg}`)
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
  })
}

// endregion

// region 仪表查询
// 仪表查询
const equipCodeListLoading = ref(false);
function queryEquipCodeList(row: any) {
  equipCodeListLoading.value = true;
  getEnergyEquipCodeList({
    worksheetCode: prop.sheetMessage?.workSheetCode,
    bindingId: prop.id,
    taskCode: row.catchCode,
  }).then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
      selectOptions.value = [];
      data.forEach((item: any) => {
        selectOptions.value.push({
          label: `${item.equipmentName}`,
          value: item.equipmentCode
        })
      })
      queryLog(selectOptions.value[0].value)

      if (selectOptions.value.length > 0) {
        activeKey.value = selectOptions.value[0].value
        formState.value.energyEquipCode = selectOptions.value[0].value
      }
    } else {
      message.error(`操作失败请联系管理员${msg}`)
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
  }).finally(() => {
    equipCodeListLoading.value = false;
  });
}
// 日志加载状态
const logLoading = ref(false);
// 日志
const logArr = ref<any>([]);
function queryLog(equipCode: string) {
  logLoading.value = true;
  getEnergyHisory({
    equipCode,
    worksheetCode: prop.sheetMessage?.workSheetCode,
    bindingId: prop.id,
  }).then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
      logArr.value = data;
      if (data.length > 0) {
        /*formState.value = data[0];*/
        formState.value.catchDataType = data[0].energyType;
        formState.value.opType = data[0].opType;
        formState.value.errorCode = data[0].errorCode;
        formState.value.energyValue = data[0].energyValue;
      }
    } else {
      message.error(`操作失败请联系管理员${msg}`)
    }
  }).catch((err) => {
    message.error(`操作失败请联系管理员,${err.message? err.message : err}`);
  }).finally(() => {
    logLoading.value = false;
  });
}
// endregion


// region 初始化

function init() {
  tableLoading.value = true;
  getEnergyToDoList({
    workstationCode: prop.workstationMessage?.workstationCode,
    worksheetCode: prop.sheetMessage?.workSheetCode,
    bindingId: prop.id,
    opsetDetailId: prop.opsetDetailId,
  }).then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
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
  init();
  queryErrorCode();
});

// endregion


</script>

<template>
  <vxe-table
    :data="tableData"
    :loading="tableLoading"
    header-align="center"
    header-cell-class-name="table_head"
    height="300"
    border
    :style="{
      'max-width': `calc(100vw - 250px)`
    }"
    :rowClassName="({ row }: any) => {
      if (row.catchStatus === 1 && row.nowFlag) {
        return 'completed';
      }
      return row.nowFlag ? 'toBeCompleted' : 'nowFlag'
    }"
  >
    <vxe-column type="seq" width="60"></vxe-column>
    <vxe-column field="catchCode" min-width="120" title="采集任务编号"></vxe-column>
    <vxe-column field="catchTypeName" min-width="120" title="采集类型"></vxe-column>
    <vxe-column field="statusName" min-width="120" title="采集状态"></vxe-column>
    <vxe-column field="catchTime" min-width="180" title="采集开始时间"></vxe-column>
    <vxe-column field="catchDataTypeName" min-width="120" title="采集对象"></vxe-column>
    <vxe-column min-width="120" title="操作">
      <template #default="{ row }">
        <vxe-button
          mode="text"
          status="primary"
          @click="showGatherIngredients(row)"
          :disabled="!row.nowFlag"
        >采集</vxe-button>
      </template>
    </vxe-column>
  </vxe-table>

  <a-drawer
    v-model:open="isShow"
    title="能耗采集"
    placement="right"
    @close="close"
    :width="700"
    :footer-style="{ textAlign: 'right' }"
  >
    <a-spin :spinning="equipCodeListLoading">
      <a-tabs
        v-model:active-key="activeKey"
        tab-position="top"
        @change="(_value: any) => {
        formRef.resetFields();
        formState.energyEquipCode = _value;
        queryLog(_value)
      }"
      >
        <a-tab-pane
          v-for="(item) of selectOptions"
          :key="item.value"
        >
          <template #tab>
            <!--          :class="{have_been_added: index===1}"-->
            <span >
            {{  item.label }}
          </span>
          </template>
        </a-tab-pane>
      </a-tabs>
      <a-form
        v-if="selectOptions && selectOptions.length > 0"
        ref="formRef"
        :model="formState"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item
          label="仪表编号"
          name="energyEquipCode"
          :rules="[{ required: true, message: '该项为必填项!' }]"

        >
          <a-select
            v-model:value="formState.energyEquipCode"
            show-search
            placeholder="请选择"
            disabled
          >
            <a-select-option
              v-for="(item, index) of selectOptions"
              :key="index"
              :value="item.value">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          label="操作类型"
          name="opType"
          :rules="[{ required: true, message: '该项为必填项!' }]"

        >
          <a-select
            v-model:value="formState.opType"
            show-search
            placeholder="请选择"
            :options="typeOptions"
            @change="(value: any) => {
            if (value === 1) {
              formState.errorCode = errorOptions[0].value;
              formState.errorName = errorOptions[0].label;
            }
          }"
          ></a-select>
        </a-form-item>
        <a-form-item
          label="异常类型"
          name="errorCode"
          :rules="[{ required: true, message: '该项为必填项!' }]"

        >
          <a-select
            v-model:value="formState.errorCode"
            show-search
            placeholder="请选择"
            :options="errorOptions"
            @change="(_value: any, _item: any) => {
            formState.errorCode = _item.value;
            formState.errorName = _item.label;
          }"
          ></a-select>
        </a-form-item>
        <a-form-item
          label="抄表读数"
          name="energyValue"
          :rules="[{ required: true, message: '该项为必填项!' }]"

        >
          <a-input-number
            v-model:value="formState.energyValue"
            min="0"
          />
        </a-form-item>
        <a-form-item
          label="备注"

        >
          <a-input
            v-model:value="formState.remark"
          />
        </a-form-item>
        <a-form-item
          label="图片"
          name="energyValue"
        >
          <a-upload
            v-model:file-list="fileList"
            :action="BASE_URL + '/process/productSop/fileUpload'"
            list-type="picture"
            name="file"
          >
            <a-button>
              <upload-outlined></upload-outlined>
              上传
            </a-button>
          </a-upload>
        </a-form-item>
        <a-form-item :wrapper-col="{offset: 6}">
          <a-button type="primary" style="width: 100%;" @click="submit" :loading="submitLoading">提交</a-button>
        </a-form-item>
      </a-form>
    </a-spin>

    <div class="log-container">
      <a-spin :spinning="logLoading">
        <a-timeline>
          <a-timeline-item
            v-for="(item) of logArr"
            :color="item.errorCode === 'SCZZ' ? 'green' : 'red'"
            :key="item.id"
          >
            <p>抄表读数: {{ item.energyValue }}</p>
            <p>异常类型: {{ item.errorName }}</p>
            <p>抄表时间: {{ item.catchTime }}</p>
          </a-timeline-item>
        </a-timeline>
      </a-spin>
    </div>
  </a-drawer>
</template>

<style scoped lang="scss">
:deep(.ant-tabs-content-holder) {
  display: none;
}
.have_been_added {
  color: #008b07;
}
:deep(.nowFlag) {
  background: #d5d5d5;
}
:deep(.toBeCompleted) {
  background: #b8f5ba;
}
:deep(.completed) {
  background: #e3f5b8;
}

@media screen and (min-width: 1100px) {
  .log-container {
    position: absolute;
    top: 0;
    padding: 2em;
    background: white;
    height: 100vh;
    width: 300px;
    transform: translateX(-110%);
    overflow-y: auto;
  }
}
@media screen and (max-width: 1100px) {
  .log-container {
    position: relative;
    left: 160px;
  }
}
</style>
