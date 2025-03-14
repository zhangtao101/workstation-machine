<script setup lang="ts">
import dayjs from 'dayjs'
import { onMounted, ref } from 'vue'
import {
  getHomepage,
  getProductByWorksheetAndBindingId,
  humanLogin,
  humanLogout
} from '@/services/machine-summary.service'
import { message, Modal } from 'ant-design-vue'
import { listWordListByParentCode, outPutSmkWorksheet } from '@/services/process-arameter.service'

// region 用户操作

// 用户名

const userName = ref()
// 当前已登录的用户名
const loginUser = ref()

/**
 * 退出登录
 */
function logout() {
  humanLogout(userName.value, localStorage.equipmentCode).then(({ data }: any) => {
    if (data.code == 200) {
      loginUser.value = ''
      localStorage.clear();
      location.reload();
    } else {
      message.error({
      content: `操作失败请联系管理员${data.msg}`,

    })
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
// 产品选项
const productOptions = ref<any>([]);
// 工作台
const equipmentCode = ref<any>({ });
// 加载状态
const homePageLoading = ref(false);

/**
 * 查询机台汇总信息
 */
function inquiryTable() {
  homePageLoading.value = true;
  equipmentCode.value = localStorage.equipmentCode
  if (!localStorage.equipmentCode) return;
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
        //   loginUser.value = undefined;
        // }
        equipMessage.value = equipStatusDTOs
        sheetMessage.value = sheetStatusDTOs[0]
        workstationMessage.value = workstationSetRecord
        productOptions.value = [];
        if (workstationMessage.value.workstationName.includes('抛光') || workstationMessage.value.workstationName.includes('湿磨')) {
          getProductByWorksheetAndBindingId({
            worksheetCode: sheetMessage.value.workSheetCode,
          }).then(({ data: {code, data, msg} }: any) => {
            if (code == 200) {
              data.forEach((item: any) => {
                productOptions.value.push({
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
        } else {
          sheetStatusDTOs.forEach((item: any) => {
            productOptions.value.push({
              label: `${item.productCode}-${item.productName}`,
              value: item.productCode,
            });
          });
        }
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


// region 出站
// 报工表单
const formState = ref<any>([]);
// form表单
const formRef = ref();
// 操作类型
const opType = ref(0);

function addLine(type: number, item?: any) {
  switch(type) {
    case 1:
      formState.value.push({
        productCode: '',
        defectCode: '',
        reportNumber: '',
        qualityNumber: '',
        unqualityNumber: '',
        personTime: '',
        equipTime: '',
        reportUser: localStorage.username,
      });
      break;
    case 2:
      if (!item.personDetails) {
        item.personDetails = [];
      }
      item.personDetails.push({
        reportNumber: '',
        qualityNumber: '',
        unqualityNumber: '',
        personTime: '',
        reportUser: '',
      });
      break;
  }
}

function delLine(index: number, i?: number) {
  Modal.confirm({
    title: '确定删除吗？',
    onOk() {
      if (i || i >= 0) {
        formState.value[index].personDetails.splice(i, 1);
      } else {
        formState.value.splice(index, 1);
      }
    },
  });
}

/**
 * 提交
 */
function submit() {
  formRef.value.validate()
    .then(() => {
      formState.value.forEach((item: any) => {
        if(!item.personDetails) {
          item.personDetails = [];
        }
      });
      outPutSmkWorksheet({
        workstationCode:  workstationMessage.value.workstationCode,
        worksheetCode: sheetMessage.value.workSheetCode,
        opType: opType.value,
        reportVMs: formState.value
      }).then(({ data: {code, data, msg} }: any) => {
        if (code == 200) {
          message.success('提交成功');
          formState.value = [];
          opType.value = 0;
          localStorage.lockProductCode = '';
          localStorage.lockProductValue = '';
          localStorage.equipmentCode = '';
          setTimeout(() => {
            location.reload();
          }, 500);
        } else {
          message.error(`操作失败请联系管理员${msg}`)
        }
      }).catch((err) => {
        message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
      })
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
function workStationChange() {
  localStorage.removeItem('lockProductCode')
  localStorage.removeItem('equipmentCode')
  localStorage.removeItem('equipmentName')
  localStorage.removeItem('lockProductValue')
  location.reload();
}


onMounted(() => {
  inquiryTable()
  loginUser.value = localStorage.username
  queryErrorCode();
})
</script>

<template>

  <div class="container">
    <a-spin :spinning="homePageLoading">
      <h2 v-if="!equipmentCode">请先进站!</h2>
      <a-space v-else direction="vertical">
        <div>
          <h3>
            当前工作站: {{ workstationMessage?.workstationName + '-' +  workstationMessage?.workstationCode}}
            <a-button v-if="workstationMessage" type="primary" @click="workStationChange">
              工作站切换
            </a-button>

            <a-popconfirm
              cancel-text="取消"
              ok-text="退出"
              placement="leftTop"
              title="是否确认退出登录?"
              @confirm="logout"
            >
              <a-button style="position:absolute; right: 1em;" type="primary"> 退出登录</a-button>
            </a-popconfirm>
          </h3>
          <h3>当前信息: </h3>
        </div>
        <a-descriptions>
          <a-descriptions-item label="人员">{{ userMessage?.userName }}</a-descriptions-item>
          <a-descriptions-item label="工号">{{ userMessage?.userCode }}</a-descriptions-item>
          <a-descriptions-item label="登入时间">{{ dayjs(userMessage?.opTime).format('YYYY-MM-DD HH:mm:ss') }}
          </a-descriptions-item>
        </a-descriptions>


        <div class="work_order_information">
          <a-descriptions>
            <a-descriptions-item :span="3" label="工单号">
              {{ sheetMessage ? sheetMessage.workSheetCode : ''}}
            </a-descriptions-item>
            <a-descriptions-item label="设备编号">{{ equipMessage && equipMessage[0] ? equipMessage[0].equipCode : '' }}</a-descriptions-item>
            <a-descriptions-item label="设备号">{{ equipMessage && equipMessage[0] ? equipMessage[0].equipCode : '' }}</a-descriptions-item>
            <a-descriptions-item label="工单号">{{ sheetMessage ? sheetMessage.workSheetCode : '' }}</a-descriptions-item>
          </a-descriptions>
        </div>

        <a-row v-if="opType === 0">
          <a-col :span="6">
            <a-button type="primary" @click="opType = 1" style="width: 100%;">完工出站</a-button>
          </a-col>
          <a-col :offset="12" :span="6">
            <a-button type="primary" @click="opType = 2" style="width: 100%;">暂停下线</a-button>
          </a-col>
        </a-row>

        <div v-if="opType !== 0">
          <a-space direction="vertical" style="width: 100%;">
            <a-form
              ref="formRef"
              layout="inline"
              :model="formState"
            >
              <template v-for="(item, index) of formState" :key="index">
                <a-space direction="vertical" style="border:1px solid red; margin: 1em 0;padding: 0.5em;">
                  <a-row>
                    <a-col :span="6">
                      <a-form-item
                        label="产品编号"
                        :name="[index, 'productCode']"
                        :rules="[{ required: true, message: '该项为必填项!' }]"
                      >
                        <a-select
                          v-model:value="item.productCode"
                          show-search
                          placeholder="请选择"
                          style="width: 200px"
                          :options="productOptions"
                        ></a-select>
                      </a-form-item>
                    </a-col>
                    <a-col :span="6">
                      <a-form-item
                        label="缺陷代码"
                        :name="[index, 'defectCode']"
                      >
                        <!--                      :rules="[{ required: true, message: '该项为必填项!' }]"-->
                        <a-select
                          v-model:value="item.defectCode"
                          show-search
                          placeholder="请选择"
                          style="width: 200px"
                          :options="defectOptions"
                        ></a-select>
                      </a-form-item>
                    </a-col>
                    <a-col :span="6">
                      <a-form-item
                        label="报工数量"
                        :name="[index, 'reportNumber']"
                        :rules="[{ required: true, message: '该项为必填项!' }]"
                      >
                        <a-input-number :min="0" v-model:value="item.reportNumber" placeholder="报工数量"></a-input-number>
                      </a-form-item>
                    </a-col>
                    <a-col :span="6">
                      <a-form-item
                        label="良品数量"
                        :name="[index, 'qualityNumber']"
                        :rules="[{ required: true, message: '该项为必填项!' }]"
                      >
                        <a-input-number :min="0" v-model:value="item.qualityNumber" placeholder="良品数量"></a-input-number>
                      </a-form-item>
                    </a-col>
                    <a-col :span="6">
                      <a-form-item
                        label="废品数量"
                        :name="[index, 'unqualityNumber']"
                        :rules="[{ required: true, message: '该项为必填项!' }]"
                      >
                        <a-input-number :min="0" v-model:value="item.unqualityNumber" placeholder="废品数量"></a-input-number>
                      </a-form-item>
                    </a-col>
                    <a-col :span="6">
                      <a-form-item
                        label="人时"
                        :name="[index, 'personTime']"
                        :rules="[{ required: true, message: '该项为必填项!' }]"
                      >
                        <a-input-number :min="0" v-model:value="item.personTime" placeholder="人时"></a-input-number>
                      </a-form-item>
                    </a-col>
                    <a-col :span="6">
                      <a-form-item
                        label="机时"
                        :name="[index, 'equipTime']"
                        :rules="[{ required: true, message: '该项为必填项!' }]"
                      >
                        <a-input-number :min="0" v-model:value="item.equipTime" placeholder="机时"></a-input-number>
                      </a-form-item>
                    </a-col>
                    <a-col :span="6">
                      <a-form-item
                        v-if="workstationMessage.workstationName.includes('抛光') || workstationMessage.workstationName.includes('湿磨')"
                        label="待处理数量"
                        :name="[index, 'waiteWorkNumber']"
                        :rules="[{ required: true, message: '该项为必填项!' }]"
                      >
                        <a-input-number :min="0" v-model:value="item.waiteWorkNumber" placeholder="待处理数量"></a-input-number>
                      </a-form-item>
                    </a-col>
                  </a-row>
                  <a-button type="primary" @click="addLine(2, item)">添加人员</a-button>
                  <a-row v-for="(detail, i) of item.personDetails" :key="i">
                    <a-col :span="6">
                      <a-form-item
                        label="操作人"
                        :name="[index, 'personDetails', i, 'reportPerson']"
                        :rules="[{ required: true, message: '该项为必填项!' }]"
                      >
                        <a-input v-model:value="detail.reportPerson" placeholder="操作人"></a-input>
                      </a-form-item>
                    </a-col>
                    <a-col :span="6">
                      <a-form-item
                        label="报工数量"
                        :name="[index, 'personDetails', i, 'reportNumber']"
                        :rules="[{ required: true, message: '该项为必填项!' }]"
                      >
                        <a-input-number :min="0" v-model:value="detail.reportNumber" placeholder="报工数量"></a-input-number>
                      </a-form-item>
                    </a-col>
                    <a-col :span="6">
                      <a-form-item
                        label="良品数量"
                        :name="[index, 'personDetails', i, 'qualityNumber']"
                        :rules="[{ required: true, message: '该项为必填项!' }]"
                      >
                        <a-input-number :min="0" v-model:value="detail.qualityNumber" placeholder="良品数量"></a-input-number>
                      </a-form-item>
                    </a-col>
                    <a-col :span="6">
                      <a-form-item
                        label="废品数量"
                        :name="[index, 'personDetails', i, 'unqualityNumber']"
                        :rules="[{ required: true, message: '该项为必填项!' }]"
                      >
                        <a-input-number :min="0" v-model:value="detail.unqualityNumber" placeholder="废品数量"></a-input-number>
                      </a-form-item>
                    </a-col>
                    <a-col :span="6">
                      <a-form-item
                        label="人时"
                        :name="[index, 'personDetails', i, 'personTime']"
                        :rules="[{ required: true, message: '该项为必填项!' }]"
                      >
                        <a-input-number :min="0" v-model:value="detail.personTime" placeholder="人时"></a-input-number>
                      </a-form-item>
                    </a-col>
                    <a-col :span="6">
                      <a-button type="primary" style="width:100%;position: absolute;bottom: 0;" danger @click="delLine(index, i)">删除</a-button>
                    </a-col>
                  </a-row>
                  <a-row>
                    <a-col :offset="18" :span="6">
                      <a-button type="primary" style="width:100%;" danger @click="delLine(index)">删除</a-button>
                    </a-col>
                  </a-row>
                </a-space>
              </template>
            </a-form>
            <a-button type="primary" @click="addLine(1)" style="width:100%">添加</a-button>
            <a-button type="primary" @click="submit()" :disabled="formState.length === 0" style="width:100%">出站</a-button>
          </a-space>
        </div>
      </a-space>
    </a-spin>
  </div>
</template>

<style scoped lang="scss">

.container {
  padding: .2em 1em;
  max-height: calc(100vh - 80px);
  max-width: calc(100vw - 200px);
  overflow-y: auto;
  overflow-x: hidden;

  .work_order_information {
    background: #efefef;
    border-radius: 1em;
    box-sizing: border-box;
    padding: 1em 1em 0 1em;
  }

  .feeding_record {
    margin: 3em 0;
    background: #bfe5f8;
    border-radius: 1em;
    box-sizing: border-box;
    padding: 1em;
  }

  .operation {
    margin-top: 1em;
    text-align: right;
  }
}
</style>
