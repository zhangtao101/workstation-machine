<script setup lang="ts">
import dayjs from 'dayjs'
import { onMounted, ref } from 'vue'
import { getHomepage, humanLogin, humanLogout } from '@/services/machine-summary.service'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import Detail from '@/components/inStation/detail.vue'
import WorkOrderSwitching from '@/components/inStation/work-order-switching.vue'

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
// 加载状态
const homePageLoading = ref(false);
// 杂收
const zsStatus = ref(false);
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
          workstationSetRecord,
          unit,
          zsFlag
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
      if (!sheetMessage.value) {
        message.error({
          content: `未识别到工单，请重新选择工单进站`,
        })
        workStationChange();
      }
      workstationMessage.value = workstationSetRecord
      zsStatus.value = zsFlag
      unitMessage.value = unit
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

const router = useRouter();
function workStationChange() {
  localStorage.removeItem('lockProductCode')
  localStorage.removeItem('equipmentCode')
  localStorage.removeItem('equipmentName')
  localStorage.removeItem('lockProductValue')
  router.push(`/workRderInStation`);
}


onMounted(() => {
  inquiryTable()
  loginUser.value = localStorage.username
})
</script>

<template>

  <div class="container">
    <a-spin :spinning="homePageLoading">
      <a-space direction="vertical">
        <div>
          <h3>
            当前工作站: {{ workstationMessage?.workstationName + '-' +  workstationMessage?.workstationCode}}
            <a-button v-if="workstationMessage" type="primary" @click="workStationChange">
              工作站切换
            </a-button>
            <work-order-switching :workstationMessage="workstationMessage" v-if="workstationMessage"/>

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
            <a-descriptions-item :span="1" label="工单累计报工量">
              {{ sheetMessage ? sheetMessage.totalReportNumber + unitMessage : ''}}
            </a-descriptions-item>
            <a-descriptions-item :span="1" label="工单累计良品量">
              {{ sheetMessage ? sheetMessage.totalQualityNumber + unitMessage : ''}}
            </a-descriptions-item>
            <a-descriptions-item :span="1" label="工单累计废品量">
              {{ sheetMessage ? sheetMessage.totalUnqualityNumber + unitMessage : ''}}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <a-card v-if="workstationMessage" style="max-width: calc(100vw - 250px)">
          <a-tabs>
            <a-tab-pane
              v-for="(item, index) of workstationMessage.bindingdtos"
              :key="item.id + '' + index"
              :tab="item.processName"
            >
              <detail
                :id="item.id"
                :processName="item.processName"
                :equipt="equipMessage"
                :equipCodeList="item.equipCodeList"
                :sheetMessage="sheetMessage"
                :workstationMessage="workstationMessage"
                :unitMessage="unitMessage"
                :zsStatus="zsStatus"
              />
            </a-tab-pane>
          </a-tabs>
        </a-card>
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
