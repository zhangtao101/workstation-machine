<script setup lang="ts">

import { onMounted, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  getReportHistory,
  getReportToDoList,
  listWordListByParentCode, worksheetFXReport,
  worksheetReport, worksheetWGReport
} from '@/services/process-arameter.service'
import { getProductByWorksheetAndBindingId, getWorksheetCurrentTime } from '@/services/machine-summary.service'

const prop = defineProps({
  id: {
    type: Number,
    required: true,
  },
  checkedTypeName: {
    type: String,
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
  unitMessage: {
    type: String,
    required: false,
    default: ''
  },
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

// region 提交历史查询
// 日志
const logArr = ref<any>([]);
const cyNumber = ref(0);
const ryNumber = ref(0);


function queryLog(row: any) {
  getReportHistory({
    taskCode: row.taskCode,
    equipCode: prop.workstationMessage?.workstationCode,
    worksheetCode: prop.sheetMessage?.workSheetCode,
    bindingId: prop.id,
  }).then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
      console.log(data)
      cyNumber.value = data.cyNumber;
      ryNumber.value = data.ryNumber;
      logArr.value = data.list;
    } else {
      message.error({
        content: `操作失败请联系管理员${msg}`,

      })
    }
  }).catch((err) => {
    message.error(`操作失败请联系管理员,${err.message? err.message : err}`);
  })
}

// endregion

// region 报工
const isShow = ref(false);
// 报工表单
const formState = ref<any>({ });
// 选中的行
const selectedRow = ref<any>([]);
// 报工内容
const selectedRowData = ref<any>([]);
// 产品列表
const productCodes = ref<any>([]);
// form表单
const formRef = ref();

/**
 * 显示抽屉
 * @param row
 */
function showReportForWork(row: any) {
  isShow.value = true;
  selectedRow.value = row;
  selectedRowData.value = JSON.parse(row.reportData)['报工内容设置'];
  productCodes.value = [];

  queryLog(row);
  queryTime();
  getProductByWorksheetAndBindingId({
    worksheetCode: prop.sheetMessage?.workSheetCode,
  }).then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
      data.forEach((item: any) => {
        productCodes.value.push({
          label: `${item.productCode}-${item.productName}`,
          value: item.productCode,
        });
      });
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
  })

}

/**
 * 查询人事机时
 * @param row
 */
function queryTime() {
  // worksheetCode
  getWorksheetCurrentTime({
    workstationCode: prop.workstationMessage?.workstationCode,
    worksheetCode: prop.sheetMessage?.workSheetCode,
  }).then(({ data: {code, data, msg} }: any) => {
    console.log(data.currentTime)
    if (code == 200) {
      if (data.currentTime) {
        formState.value.personTime =  (1 * data.currentTime).toFixed(2);
        formState.value.equipTime = (1 * data.currentTime).toFixed(2);
      }
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
  })
}

/**
 * 关闭
 */
function close() {
  isShow.value = false;
  selectedRowData.value = [];
  productCodes.value = []
  selectedRow.value = { }
  formState.value = []
}

/**
 * 新增一行
 * @param type 类型
 * @param item 当前选择的行
 */
function addLine(type: number, item?: any) {
  switch(type) {
    case 1:
      if (!formState.value.details) {
        formState.value.details = [];
      }
      formState.value.details.push({
        productCode: '',
        defectCode: '',
        reportNumber: 0,
        qualityNumber: 0,
        unqualityNumber: 0,
        reportNumber_T: 0,
        qualityNumber_T: 0,
        unqualityNumber_T: 0,
        personTime: 0,
        equipTime: 0,
        waiteNumber: 0,
        reportUser: localStorage.username
      });
      break;
    case 2:
      if (!item.personDetails) {
        item.personDetails = [];
      }
      item.personDetails.push({
        reportNumber: 0,
        qualityNumber: 0,
        unqualityNumber: 0,
        reportNumber_T: 0,
        qualityNumber_T: 0,
        unqualityNumber_T: 0,
        personTime: 0,
        reportUser: '',
      });
      break;
  }
}

/**
 * 删除一行
 * @param index
 * @param i
 */
function delLine(index: number, i?: number) {
  Modal.confirm({
    title: '确定删除吗？',
    onOk() {
      console.log(index, i, formState.value)
      if (i >= 0) {
        formState.value.details[index].personDetails.splice(i, 1);
      } else {
        formState.value.details.splice(index, 1);
      }
    },
  });
}

// 面积系数
const squareCoefficient =  ref(1);
/**
 * 报工数量改变
 * @param item 当前报工元素
 * @param type 输入类型
 */
function numberChange(item: any, type: number){
  item.reportNumber = item.reportNumber || 0;
  item.qualityNumber = item.qualityNumber || 0;
  item.unqualityNumber = item.unqualityNumber || 0;
  switch(type) {
    case 1:
      /*// 良品数量不能大于报工数量
      if (item.qualityNumber > item.reportNumber) {
        item.qualityNumber = item.reportNumber;
      }
      // 如果同时存在报工数量和良品数量，那么不合格数量就是报工数量减去良品数量
      if (item.reportNumber >= 0 && item.qualityNumber >= 0) {
        item.unqualityNumber = item.reportNumber - item.qualityNumber;
      }*/
      item.reportNumber = (item.qualityNumber + item.unqualityNumber).toFixed(3);
      if (prop.unitMessage === 'KG') {
        item.qualityNumber_T = (item.qualityNumber / 1000).toFixed(3);
        item.reportNumber_T = (item.reportNumber / 1000).toFixed(3);
        item.unqualityNumber_T = (item.unqualityNumber / 1000).toFixed(3);
      } else if (prop.unitMessage === '片') {
        item.qualityNumber_pf = (item.qualityNumber * squareCoefficient.value).toFixed(3);
        item.reportNumber_pf = (item.reportNumber * squareCoefficient.value).toFixed(3);
        item.unqualityNumber_pf = (item.unqualityNumber * squareCoefficient.value).toFixed(3);
      }
      break;
    case 2:
      /*// 良品数量不能大于报工数量
      if (item.qualityNumber_T > item.reportNumber_T) {
        item.qualityNumber_T = item.reportNumber_T;
      }
      // 如果同时存在报工数量和良品数量，那么不合格数量就是报工数量减去良品数量
      if (item.reportNumber_T >= 0 && item.qualityNumber_T >= 0) {
        item.unqualityNumber_T = item.reportNumber_T - item.qualityNumber_T;
      }*/
      item.reportNumber_T = (item.qualityNumber_T * 1 + item.unqualityNumber_T * 1).toFixed(3);
      if (prop.unitMessage === 'KG') {
        item.qualityNumber = item.qualityNumber_T * 1000;
        item.reportNumber = item.reportNumber_T * 1000;
        item.unqualityNumber = item.unqualityNumber_T * 1000;
      } else if (prop.unitMessage === '片') {
        item.qualityNumber_pf = (item.qualityNumber * squareCoefficient.value).toFixed(3);
        item.reportNumber_pf = (item.reportNumber * squareCoefficient.value).toFixed(3);
        item.unqualityNumber_pf = (item.unqualityNumber * squareCoefficient.value).toFixed(3);
      }
      break;
  }
}

const submitLoading = ref(false);
/**
 * 提交
 */
function submit() {
  formRef.value.validate()
    .then(() => {
      Modal.confirm({
        title: '操作确认',
        content: '是否确认报工?',
        onOk() {
          submitLoading.value = true;
          formState.value.details.forEach((item: any) => {
            item.personTime = formState.value.personTime;
            item.equipTime = formState.value.equipTime;
            item.defectCode = item.defectCode || '';
          });
          let ob: any;
          if (prop.workstationMessage?.workstationName.includes('卧干')) {
            ob =  worksheetWGReport({
              taskCode: selectedRow.value.taskCode,
              worksheetCode: selectedRow.value.worksheetCode,
              bindingId: prop.id,
              productCodes: formState.value.details
            })
          }
          else if (prop.workstationMessage?.workstationName.includes('抛光')) {
            ob =  worksheetFXReport({
              taskCode: selectedRow.value.taskCode,
              worksheetCode: selectedRow.value.worksheetCode,
              bindingId: prop.id,
              productCodes: formState.value.details
            })
          }
          else {
            ob =  worksheetReport({
              taskCode: selectedRow.value.taskCode,
              worksheetCode: selectedRow.value.worksheetCode,
              bindingId: prop.id,
              productCodes: formState.value.details
            })
          }
         ob.then(({ data: {code, data, msg} }: any) => {
            if (code == 200) {
              message.success('提交成功');
              close();
              init();
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
        },
        onCancel() {
          message.warning('已取消!');
        },
        class: 'test',
      });
    })
    .catch((error: any) => {
      console.log('error', error);
    });
}

// endregion



// region 缺陷代码
const defectOptions = ref<any>([]);
function queryErrorCode() {
  listWordListByParentCode('CPQXLB').then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {
      defectOptions.value = [];
      data.forEach((item: any) => {
        defectOptions.value.push({
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


// region 初始化
function init() {
  tableLoading.value = true;
  getReportToDoList({
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
    message.error(`操作失败请联系管理员,${err.message ? err.message : err}`)
  }).finally(() => {
    tableLoading.value = false;
  });


  if (prop.unitMessage === '片') {
    getProductByWorksheetAndBindingId({
      worksheetCode: prop.sheetMessage?.workSheetCode,
    }).then(({ data: {code, data, msg} }: any) => {
      if (code == 200) {
        console.log(data)
        // todo 等待返回面积系数
        squareCoefficient.value = data[0].conversionFaction ?? 1;
      }
    }).catch((err) => {
      message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
    })
  }
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
    :edit-config="editConfig"
    :height="300"
    :style="{
      'max-width': `calc(100vw - 250px)`
    }"
    :rowClassName="({ row }: any) => {
      if (row.reportStatus === 1 && row.nowFlag) {
        return 'completed';
      }
      return row.nowFlag ? 'toBeCompleted' : 'nowFlag'
    }"
  >
    <vxe-column type="seq" width="60"></vxe-column>
    <vxe-column field="worksheetCode" min-width="160" title="工单号"></vxe-column>
    <vxe-column field="reportTypeName" min-width="120" title="报工类型"></vxe-column>
    <vxe-column field="statusName" min-width="160" title="报工任务执行状态"></vxe-column>
    <vxe-column field="reportTime" min-width="160" title="报工时间"></vxe-column>
    <vxe-column title="操作" min-width="180" fixed="right">
      <template #default="{ row }">
        <vxe-button
          mode="text"
          status="primary"
          :disabled="!row.nowFlag"
          @click="showReportForWork(row)"
        >报工</vxe-button>
<!--        :disabled="!row.nowFlag"-->
      </template>
    </vxe-column>
  </vxe-table>

  <a-drawer
    v-model:open="isShow"
    title="报工"
    placement="top"
    @close="close"
    :height="400"
    :footer-style="{ textAlign: 'right' }"
  >
    <a-form
      ref="formRef"
      layout="inline"
      :model="formState"
      :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }"
    >
      <a-row>
        <a-col :span="6">
          <a-form-item
            label="人时"
            name="personTime"
            :rules="[{ required: true, message: '该项为必填项!' }]"
          >
            <a-input-number
              v-model:value="formState.personTime"
              :min="0"
              placeholder="人时"
              addon-after="小时"
            ></a-input-number>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item
            label="机时"
            name="equipTime"
            :rules="[{ required: true, message: '该项为必填项!' }]"
          >
            <a-input-number
              v-model:value="formState.equipTime"
              :min="0"
              placeholder="机时"
              addon-after="小时"
            ></a-input-number>
          </a-form-item>
        </a-col>
        <a-col :span="6" v-if="workstationMessage?.workstationName.includes('烧成') && checkedTypeName?.includes('出窑')">
          <a-form-item
            label="入窑数"
          >
            <a-input-number
              v-model:value="ryNumber"
              :min="0"
              placeholder="入窑数"
              :addon-after="unitMessage"
              readonly
            ></a-input-number>
          </a-form-item>
        </a-col>
        <a-col :span="6" v-if="workstationMessage?.workstationName.includes('烧成') && checkedTypeName?.includes('出窑')">
          <a-form-item
            label="出窑数"
          >
            <a-input-number
              v-model:value="cyNumber"
              :min="0"
              placeholder="出窑数"
              :addon-after="unitMessage"
              readonly
            ></a-input-number>
          </a-form-item>
        </a-col>
      </a-row>
      <template v-for="(item, index) of formState.details" :key="index">
        <a-space direction="vertical" style="border:1px solid red; margin: 1em 0;padding: 0.5em;">
          <!-- region 基本信息 -->
          <a-row>
            <a-col :span="6">
              <a-form-item
                label="产品编号"
                :name="['details', index, 'productCode']"
                :rules="[{ required: true, message: '该项为必填项!' }]"
              >
                <a-select
                  v-model:value="item.productCode"
                  show-search
                  placeholder="请选择"
                  :options="productCodes"
                ></a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item
                label="缺陷代码"
                :name="['details', index, 'defectCode']"
                :rules="[{ required: workstationMessage?.workstationName.includes('打包') || workstationMessage?.workstationName.includes('分选'), message: '该项为必填项!' }]"
              >
<!--                :rules="[{ required: true, message: '该项为必填项!' }]" -->
                <a-select
                  v-model:value="item.defectCode"
                  show-search
                  placeholder="请选择"
                  allowClear
                  :options="defectOptions"
                ></a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item
                label="入库批次号"
                v-if="workstationMessage?.workstationName.includes('抛光') || workstationMessage?.workstationName.includes('打包')"
              >
<!--                :rules="[{ required: true, message: '该项为必填项!' }]" -->
                <a-input
                  v-model:value="item.batchCode"
                  allowClear
                ></a-input>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="6">
              <a-form-item
                label="良品数量"
                :min="0"
                :name="['details', index, 'qualityNumber']"
                :rules="[{ required: true, message: '该项为必填项!' }]"
              >
                <a-input-number
                  v-model:value="item.qualityNumber"
                  placeholder="良品数量"
                  :addon-after="unitMessage"
                  :min="0"
                  @change="numberChange(item, 1)"
                ></a-input-number>
                <a-input-number
                  v-model:value="item.qualityNumber_T"
                  placeholder="良品数量"
                  addon-after="T"
                  :min="0"
                  v-if="unitMessage === 'KG'"
                  style="margin-top: 1em;"
                  @Change="numberChange(item, 2)"
                />
                <a-input-number
                  v-model:value="item.qualityNumber_pf"
                  addon-after="㎡"
                  :min="0"
                  v-if="unitMessage === '片'"
                  style="margin-top: 1em;"
                  readonly
                />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item
                label="废品数量"
                :name="['details', index, 'unqualityNumber']"
                :rules="[{ required: true, message: '该项为必填项!' }]"
              >
                <a-input-number
                  v-model:value="item.unqualityNumber"
                  placeholder="废品数量"
                  :addon-after="unitMessage"
                  :min="0"
                  @change="numberChange(item, 1)"
                ></a-input-number>
                <a-input-number
                  v-model:value="item.unqualityNumber_T"
                  placeholder="废品数量"
                  addon-after="T"
                  :min="0"
                  v-if="unitMessage === 'KG'"
                  style="margin-top: 1em;"
                  @change="numberChange(item, 2)"
                />
                <a-input-number
                  v-model:value="item.unqualityNumber_pf"
                  addon-after="㎡"
                  :min="0"
                  v-if="unitMessage === '片'"
                  style="margin-top: 1em;"
                  readonly
                />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item
                label="报工数量"
              >
                <a-input-number
                  v-model:value="item.reportNumber"
                  placeholder="报工数量"
                  :addon-after="unitMessage"
                  :min="0"
                  readonly
                  @change="numberChange(item, 1)"
                ></a-input-number>
                <a-input-number
                  v-model:value="item.reportNumber_T"
                  placeholder="报工数量"
                  addon-after="T"
                  :min="0"
                  readonly
                  v-if="unitMessage === 'KG'"
                  style="margin-top: 1em;"
                  @Change="numberChange(item, 2)"
                />
                <a-input-number
                  v-model:value="item.reportNumber_pf"
                  addon-after="㎡"
                  :min="0"
                  v-if="unitMessage === '片'"
                  style="margin-top: 1em;"
                  readonly
                />
              </a-form-item>
            </a-col>
            <a-col :span="6" v-if="workstationMessage?.workstationName.includes('卧干')">
              <a-form-item
                label="单片干坯重量"
                :name="['details', index, 'dryWeight']"
                :rules="[{ required: true, message: '该项为必填项!' }]"
              >
                <a-input-number
                  v-model:value="item.dryWeight"
                  :min="0"
                  placeholder="干坯重量"
                  addon-after="KG"
                ></a-input-number>
              </a-form-item>
            </a-col>
            <a-col :span="6" v-if="workstationMessage?.workstationName.includes('抛光')">
              <a-form-item
                label="等待数量"
                :name="['details', index, 'waiteNumber']"
                :rules="[{ required: true, message: '该项为必填项!' }]"
              >
                <a-input-number
                  v-model:value="item.waiteNumber"
                  :min="0"
                  placeholder="等待数量"
                  :addon-after="unitMessage"
                ></a-input-number>
              </a-form-item>
            </a-col>
          </a-row>
          <!-- endregion -->
          <a-button type="primary" @click="addLine(2, item)">添加人员</a-button>
          <!-- region 人员 -->
          <a-row v-for="(detail, i) of item.personDetails" :key="i">
            <a-col :span="12">
              <a-form-item
                label="操作人"
                :name="['details', index, 'personDetails', i, 'reportPerson']"
                :rules="[{ required: true, message: '该项为必填项!' }]"
              >
                <a-input v-model:value="detail.reportPerson" placeholder="操作人"></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item
                label="人时"
                :name="['details', index, 'personDetails', i, 'personTime']"
                :rules="[{ required: true, message: '该项为必填项!' }]"
              >
                <a-input-number
                  :min="0"
                  v-model:value="detail.personTime"
                  placeholder="人时"
                  addon-after="小时"
                ></a-input-number>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item
                label="良品数量"
                :name="['details', index, 'personDetails', i, 'qualityNumber']"
                :rules="[{ required: true, message: '该项为必填项!' }]"
              >
                <a-input-number
                  :min="0"
                  v-model:value="detail.qualityNumber"
                  placeholder="良品数量"
                  :addon-after="unitMessage"
                  @Change="numberChange(detail, 1)"
                ></a-input-number>
                <a-input-number
                  v-model:value="detail.qualityNumber_T"
                  placeholder="良品数量"
                  addon-after="T"
                  :min="0"
                  v-if="unitMessage === 'KG'"
                  style="margin-top: 1em;"
                  @Change="numberChange(detail, 2)"
                />
                <a-input-number
                  v-model:value="item.qualityNumber_pf"
                  addon-after="㎡"
                  :min="0"
                  v-if="unitMessage === '片'"
                  style="margin-top: 1em;"
                  readonly
                />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item
                label="废品数量"
                :name="['details', index, 'personDetails', i, 'unqualityNumber']"
                :rules="[{ required: true, message: '该项为必填项!' }]"
              >
                <a-input-number
                  v-model:value="detail.unqualityNumber"
                  placeholder="废品数量"
                  :addon-after="unitMessage"
                  :min="0"
                  @change="numberChange(detail, 1)"
                ></a-input-number>
                <a-input-number
                  v-model:value="detail.unqualityNumber_T"
                  placeholder="废品数量"
                  addon-after="T"
                  :min="0"
                  v-if="unitMessage === 'KG'"
                  style="margin-top: 1em;"
                  @change="numberChange(detail, 2)"
                />
                <a-input-number
                  v-model:value="detail.unqualityNumber_pf"
                  addon-after="㎡"
                  :min="0"
                  v-if="unitMessage === '片'"
                  style="margin-top: 1em;"
                  readonly
                />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item
                label="报工数量"
                :name="['details', index, 'personDetails', i, 'reportNumber']"
                :rules="[{ required: true, message: '该项为必填项!' }]"
              >
                <a-input-number
                  :min="0"
                  v-model:value="detail.reportNumber"
                  placeholder="报工数量"
                  :addon-after="unitMessage"
                  @Change="numberChange(detail, 1)"
                  readonly
                ></a-input-number>
                <a-input-number
                  v-model:value="detail.reportNumber_T"
                  placeholder="报工数量"
                  addon-after="T"
                  :min="0"
                  v-if="unitMessage === 'KG'"
                  style="margin-top: 1em;"
                  @Change="numberChange(detail, 2)"
                  readonly
                />
                <a-input-number
                  v-model:value="detail.reportNumber_pf"
                  addon-after="㎡"
                  :min="0"
                  v-if="unitMessage === '片'"
                  style="margin-top: 1em;"
                  readonly
                />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-button type="primary" style="width:100%;position: absolute;bottom: 0;" danger @click="delLine(index, i)">删除人员</a-button>
            </a-col>
          </a-row>
          <!-- endregion -->
          <a-row style="margin-top: 2em;">
            <a-col :offset="18" :span="6">
              <a-button type="primary" style="width:100%;" danger @click="delLine(index)">删除报工明细</a-button>
            </a-col>
          </a-row>
        </a-space>
      </template>
    </a-form>
    <a-button type="primary" @click="addLine(1)" style="width:100%">添加</a-button>
    <a-timeline style="margin-top: 1em;">
      <a-timeline-item
        v-for="item of logArr"
        :key="item.id"
        color="green"
      >
        <a-descriptions bordered>
          <a-descriptions-item label="产品编号">{{ item.productCode }}</a-descriptions-item>
          <a-descriptions-item label="缺陷代码">{{ item.defectCode }}</a-descriptions-item>
          <a-descriptions-item label="报工数量">{{ item.reportNumber }}{{unitMessage}}</a-descriptions-item>
          <a-descriptions-item label="良品数量">{{ item.qualityNumber }}{{unitMessage}}</a-descriptions-item>
          <a-descriptions-item label="废品数量">{{ item.unqualityNumber }}{{unitMessage}}</a-descriptions-item>
          <a-descriptions-item label="等待数量" v-if="workstationMessage?.workstationName.includes('抛光')">{{ item.waiteNumber }}{{unitMessage}}</a-descriptions-item>
          <a-descriptions-item label="人时">{{ item.personTime }}小时</a-descriptions-item>
          <a-descriptions-item label="机时">{{ item.equipTime }}小时</a-descriptions-item>
          <a-descriptions-item label="报工时间">{{ item.reportTime }}</a-descriptions-item>
        </a-descriptions>
      </a-timeline-item>
    </a-timeline>
    <template #footer>
      <a-button style="margin-right: 8px" @click="close">取消</a-button>
      <a-button type="primary" @click="submit" :loading="submitLoading">提交</a-button>
    </template>
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
</style>
