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
// 单位
const unitMessage = ref('')
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
            workstationSetRecord,
            unit,
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
        unitMessage.value = unit
        productOptions.value = [];
        if (workstationMessage.value.workstationName.includes('抛光')) {
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
// 提交加载状态
const submitLoading = ref(false);
/**
 * 提交
 */
function submit(opType: 1 | 2) {
  const title = opType === 1 ? '完工出站' : '暂停下线';
  Modal.confirm({
    title: `是否确认${title}?`,
    cancelText: '取消',
    onCancel: () => {
      message.warning('已取消');
    },
    onOk: () => {
      submitLoading.value = true;
      outPutSmkWorksheet({
        workstationCode:  workstationMessage.value.workstationCode,
        worksheetCode: sheetMessage.value.workSheetCode,
        opType: opType,
        reportVMs: []
      }).then(({ data: {code, data, msg} }: any) => {
        if (code == 200) {
          message.success('提交成功');
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
      }).finally(() => {
        submitLoading.value = false;
      });
    },
  })
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
  <a-spin :spinning="homePageLoading">
    <div class="container">
      <h2 v-if="!equipmentCode">请先进站!</h2>
      <a-space v-else direction="vertical">
        <div>
          <h3>
            当前工作站: {{ workstationMessage?.workstationName + '-' +  workstationMessage?.workstationCode}}
            <a-button v-if="workstationMessage" type="primary" @click="workStationChange">
              工作站切换
            </a-button>
            <a-popconfirm
              v-if="loginUser"
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

        <div v-if="sheetMessage && sheetMessage.workSheetCode">

          <div class="work_order_information">
            <a-descriptions :column="4">
              <a-descriptions-item :span="1" label="工单号">
                {{ sheetMessage ? sheetMessage.workSheetCode : ''}}
              </a-descriptions-item>
              <a-descriptions-item :span="1" label="计划数量">
                {{ sheetMessage ? sheetMessage.workPlanNumber + unitMessage : ''}}
              </a-descriptions-item>
              <a-descriptions-item :span="1" label="产品名称">
                {{ sheetMessage ? sheetMessage.productName : ''}}
              </a-descriptions-item>
              <a-descriptions-item :span="1" label="产品编号">
                {{ sheetMessage ? sheetMessage.productCode : ''}}
              </a-descriptions-item>
            </a-descriptions>
          </div>

          <a-row>
            <a-col :span="6">
              <a-button type="primary" @click="submit(1)" :loading="submitLoading" style="width: 100%;">完工出站</a-button>
            </a-col>
            <a-col :offset="12" :span="6">
              <a-button type="primary" @click="submit(2)" :loading="submitLoading" style="width: 100%;">暂停下线</a-button>
            </a-col>
          </a-row>
        </div>
        <div v-else>
          <h2>当前工作站没有工单未出站!</h2>
        </div>
      </a-space>
    </div>
  </a-spin>
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
