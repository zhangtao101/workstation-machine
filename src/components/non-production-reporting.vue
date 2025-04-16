<script setup lang="ts">

import { onMounted, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  getReportHistory,
  getUnProduceReportHistory,
  listWordListByParentCode,
  unProduceReport
} from '@/services/process-arameter.service'
import { BASE_URL } from '@/services/config'
import { UploadOutlined } from '@ant-design/icons-vue'
import { getHomepage } from '@/services/machine-summary.service'

// region 人时
// 表单对象
const formRef = ref();
// 表单数据
const formState = ref<any>([]);

/**
 * 添加一行
 */
function addLine() {
  formState.value.push({});
}

/**
 * 删除一行
 * @param index
 */
function deleteLine(index: number) {
  Modal.confirm({
    title: '确定删除吗？',
    onOk() {
      formState.value.splice(index, 1);
    },
  });
}

/**
 * 提交
 */
function submit() {
  formRef.value.validate().then(() => {
    unProduceReport({
      type: 2,
      personDetails: formState.value
    }).then(({ data: {code, data, msg} }: any) => {
      if (code == 200) {
        message.success(`操作成功!`);
        formRef.value.resetFields();
        formState.value.length = 0;
      } else {
        message.error(`操作失败请联系管理员${msg}`)
      }
    }).catch((err) => {
      message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
    });
  });
}

// endregion

// region 能源
// 能源form
const sourceOfEnergyForm = ref();
// 能源表单数据
const sourceOfEnergyFormState = ref<any>({  });
// 操作类型
const opTypes = ref([
  {
    label: '正常采集',
    value: 1,
  },
  {
    label: '异常采集',
    value: -1,
  }
]);
// 能源类型
const energyType = ref([
  {
    label: '天然气',
    value: 1,
  },
  {
    label: '电',
    value: 2,
  },
  {
    label: '水煤浆',
    value: 3,
  },
  {
    label: '焦炉气',
    value: 4,
  },
]);
// 设备选择
const selectOptions = ref<any>([]);
// 上传文件列表
const fileList = ref<any>([]);

function submitSourceOfEnergy() {
  sourceOfEnergyForm.value.validate().then(() => {
    const fileId: any = [];
    fileList.value.forEach(({ response: {code, data} }: any) => {
      if (code === 200) {
        fileId.push(data)
      }
    })
    const params = {
      type: 1,
      ...sourceOfEnergyFormState.value,
      fileId: fileId,
      catchUser: localStorage.username,
      workstationCode: localStorage.equipmentCode,
    };
    if (params.energyStartTime) {
      params.energyStartTime = params.energyStartTime.format('YYYY-MM-DD HH:mm:ss')
    }
    if (params.energyEndTime) {
      params.energyEndTime = params.energyEndTime.format('YYYY-MM-DD HH:mm:ss')
    }
    unProduceReport(params).then(({ data: {code, data, msg} }: any) => {
      if (code == 200) {
        message.success(`操作成功!`);
        sourceOfEnergyForm.value.resetFields();
      } else {
        message.error(`操作失败请联系管理员${msg}`)
      }
    }).catch((err) => {
      message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
    });
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


// region 机台汇总
// 人员信息
const userMessage = ref({} as any)
// 设备
const equipMessage = ref({} as any)
// 工单
const sheetMessage = ref({} as any)
// 工作站信息
const workstationMessage = ref({} as any)
// 加载状态
const homePageLoading = ref(false);

/**
 * 查询机台汇总信息
 */
function inquiryTable() {
  homePageLoading.value = true;
  getHomepage(localStorage.equipmentCode, localStorage.lockProductCode ?? '').then(({ data }) => {
    if (data.code == 200) {
      const {
        data: {
          user,
          equipStatusDTOs,
          sheetStatusDTOs,
          totalNumber,
          totalDefectNumber,
          totalQualityNumber,
          workstationSetRecord
        }
      } = data
      userMessage.value = {
        ...user,
        totalNumber,
        totalDefectNumber,
        totalQualityNumber
      }
      // if (!userMessage.value.userName) {
      //   localStorage.removeItem('username')
      // }
      equipMessage.value = equipStatusDTOs
      sheetMessage.value = sheetStatusDTOs[0]
      workstationMessage.value = workstationSetRecord

      selectOptions.value = [];
      workstationSetRecord.bindingdtos.forEach((item: any) => {
        item.equipCodeList.forEach((equip: any) => {
          if (equip.equipmentName && equip.equipmentName.includes('表')) {
            selectOptions.value.push({
              label: `${equip.equipmentCode}-${equip.equipmentName}`,
              value: equip.equipmentCode
            });
          }
        })

      })
    } else {
      message.error({
      content: `操作失败请联系管理员${data.msg}`,

    })
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
  }).finally(() => {
    homePageLoading.value = false;
  })
}

// endregion

// region 日志查询

const logArr = ref<any>([]);

function queryLog() {
  for (const item of selectOptions.value) {
    if (sourceOfEnergyFormState.value.energyEquipCode == item.value) {
      sourceOfEnergyFormState.value.energyEquipName = item.label;
    }
  }
  getUnProduceReportHistory({
    equipCode: sourceOfEnergyFormState.value.energyEquipCode,
  }).then(({ data: {code, data, msg} }: any) => {
    if (code == 200) {

      logArr.value = [data] ;
    } else {
      message.error({
        content: `操作失败请联系管理员${msg}`,

      })
    }
  }).catch((err) => {
    message.error(`操作失败请联系管理员,${err.message? err.message : err}`);
  })
}


/**
 * 能源变更, 计算变更后的数值
 * @param item 需要计算的对象
 */
function energyChange(item: any) {
  if (
    (item.startEnergyValue && item.endEnergyValue) ||
    (item.startEnergyValue === 0 && item.endEnergyValue === 0)
  ) {
    // 获取倍数
    const multiple = (energyEquipCode: string) => {
      console.log(energyEquipCode);
      const arr = energyEquipCode.split('-');
      return Number.isNaN(arr[arr.length - 1] as string)
        ? 1
        : Number.parseInt(arr[arr.length - 1] as string, 10);
    };
    item.energyValue =
      (item.endEnergyValue - item.startEnergyValue) *
      multiple(item.energyEquipName);
  }
}

// endregion

onMounted(() => {
  inquiryTable();
  queryErrorCode();
});
</script>

<template>
  <a-spin :spinning="homePageLoading">
    <a-card>
      <a-tabs>
        <a-tab-pane
          key="1"
          tab="人时"
        >
          <a-form
            ref="formRef"
            layout="inline"
            :model="formState"
            :label-col="{ span: 24 }"
            :wrapper-col="{ span: 24 }"
          >
            <a-space direction="vertical" style="width: 100%;">
              <a-row v-for="(item, index) of formState" :key="index">
                <a-col :span="6">
                  <a-form-item
                    label="操作人"
                    :name="[index, 'reportPerson']"
                    :rules="[{ required: true, message: '该项为必填项!' }]"
                  >
                    <a-input v-model:value="item.reportPerson" placeholder="操作人"></a-input>
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item
                    label="人时"
                    :name="[index, 'personTime']"
                    :rules="[{ required: true, message: '该项为必填项!' }]"
                  >
                    <a-input v-model:value="item.personTime" placeholder="人时"></a-input>
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item
                    label="机时"
                    :name="[index, 'equipTime']"
                    :rules="[{ required: true, message: '该项为必填项!' }]"
                  >
                    <a-input v-model:value="item.equipTime" placeholder="机时"></a-input>
                  </a-form-item>
                </a-col>
                <a-col :span="6">

                  <a-form-item
                  >
                    <a-button type="primary" style="width:100%;margin-top: 32px;" danger @click="deleteLine(index)">删除</a-button>
                  </a-form-item>
                </a-col>
              </a-row>

              <a-button type="primary" @click="addLine()" style="width:100%">添加</a-button>
              <a-button type="primary" @click="submit()" style="width:100%" :disabled="formState.length === 0">提交</a-button>
            </a-space>
          </a-form>
        </a-tab-pane>
        <a-tab-pane
          key="2"
          tab="能耗"
        >
          <a-form
            ref="sourceOfEnergyForm"
            :model="sourceOfEnergyFormState"
            :label-col="{ span: 8 }"
            :wrapper-col="{ span: 16 }"
          >
            <a-form-item
              label="仪表编号"
              name="energyEquipCode"
              :rules="[{ required: true, message: '该项为必填项!' }]"

            >
              <a-select
                v-model:value="sourceOfEnergyFormState.energyEquipCode"
                show-search
                placeholder="请选择"
                style="width: 200px"
                :options="selectOptions"
                @change="queryLog"
              ></a-select>
            </a-form-item>
            <a-form-item
              label="采集能源"
              name="energyType"
              :rules="[{ required: true, message: '该项为必填项!' }]"
            >
              <a-select
                v-model:value="sourceOfEnergyFormState.energyType"
                show-search
                placeholder="请选择"
                style="width: 200px"
                :options="energyType"
              ></a-select>
            </a-form-item><a-form-item
            label="操作类型"
            name="opType"
            :rules="[{ required: true, message: '该项为必填项!' }]"

          >
            <a-select
              v-model:value="sourceOfEnergyFormState.opType"
              show-search
              placeholder="请选择"
              style="width: 200px"
              :options="opTypes"
            ></a-select>
          </a-form-item>
            <a-form-item
              label="异常类型"
              name="errorCodeAndName"

            >
              <a-select
                v-model:value="sourceOfEnergyFormState.errorCodeAndName"
                show-search
                label-in-value
                placeholder="请选择"
                style="width: 200px"
                :options="errorOptions"
                @change="(value: any) => {
                sourceOfEnergyFormState.errorCode = value.value;
                sourceOfEnergyFormState.errorName = value.label;
              }"
              ></a-select>
            </a-form-item>

<!--            <a-form-item
              label="抄表读数"
              name="energyValue"
              :rules="[{ required: true, message: '该项为必填项!' }]"

            >
              <a-input-number :min="0" v-model:value="sourceOfEnergyFormState.energyValue" />
            </a-form-item>-->

            <a-form-item
              label="抄表开始读数"
              name="startEnergyValue"
              :rules="[{ required: true, message: '该项为必填项!' }]"

            >
              <a-date-picker v-model:value="sourceOfEnergyFormState.energyStartTime" show-time placeholder="时间选择" style="vertical-align: top;" />
              <a-input-number
                v-model:value="sourceOfEnergyFormState.startEnergyValue"
                min="0"
                @change="energyChange(sourceOfEnergyFormState)"
                style="vertical-align: top;margin-left: 1em;"
              />
            </a-form-item>
            <a-form-item
              label="抄表结束读数"
              name="endEnergyValue"
              :rules="[{ required: true, message: '该项为必填项!' }]"

            >
              <a-date-picker
                v-model:value="sourceOfEnergyFormState.energyEndTime"
                show-time
                placeholder="时间选择"
                style="vertical-align: top;"
                :disabled-date="(current: any) => {
              return current < sourceOfEnergyFormState.energyStartTime;
            }"
              />
              <a-input-number
                v-model:value="sourceOfEnergyFormState.endEnergyValue"
                :min="sourceOfEnergyFormState.startEnergyValue || 0"
                :disabled="!(sourceOfEnergyFormState.startEnergyValue || sourceOfEnergyFormState.startEnergyValue === 0)"
                @change="energyChange(sourceOfEnergyFormState)"
                style="vertical-align: top;margin-left: 1em;"
              />
            </a-form-item>
            <a-form-item
              label="能耗"

            >
              {{ sourceOfEnergyFormState.energyValue }}
            </a-form-item>

            <a-form-item
              label="备注"
            >
              <a-input v-model:value="sourceOfEnergyFormState.remark" />
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
            <a-form-item
              label=""
              :wrapper-col="{ offset: 8, span: 16 }"
            >
              <a-button type="primary" @click="submitSourceOfEnergy()" style="width:100%">提交</a-button>
            </a-form-item>
          </a-form>

          <a-timeline style="margin-top: 2em;">
            <a-timeline-item
              v-for="item of logArr"
              :key="item.id"
              color="green"
            >
              <a-descriptions bordered>
                <a-descriptions-item label="任务编号">{{ item.taskCode }}</a-descriptions-item>
                <a-descriptions-item label="开始时间">{{ item.startTime }}</a-descriptions-item>
                <a-descriptions-item label="结束时间">{{ item.endTime }}</a-descriptions-item>
                <a-descriptions-item label="开始电表读数">{{ item.energyValue }}</a-descriptions-item>
                <a-descriptions-item label="结束电表读数">{{ item.endEnergyValue }}</a-descriptions-item>
                <a-descriptions-item label="电表编号">{{ item.energyEquipCode }}</a-descriptions-item>
                <a-descriptions-item label="能耗类型">{{ item.energyTypeName }}</a-descriptions-item>
                <a-descriptions-item label="采集状态">{{ item.stateName }}</a-descriptions-item>
                <a-descriptions-item label="异常编码">{{ item.errorCode }}</a-descriptions-item>
                <a-descriptions-item label="异常名称">{{ item.errorName }}</a-descriptions-item>
              </a-descriptions>
            </a-timeline-item>
          </a-timeline>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </a-spin>
</template>

<style scoped lang="scss">

</style>
