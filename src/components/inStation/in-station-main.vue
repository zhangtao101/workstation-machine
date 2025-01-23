<script setup lang="ts">
import dayjs from 'dayjs'
import { onMounted, ref } from 'vue'
import { getHomepage, humanLogin, humanLogout } from '@/services/machine-summary.service'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import Detail from '@/components/inStation/detail.vue'

// region 用户操作

// 用户名

const userName = ref()
// 当前已登录的用户名
const loginUser = ref()
// 登录加载状态
const loginLoading = ref(false)
// 登录对话框是否打开
const loginOpen = ref(false)

/**
 * 登录
 */
function login() {
  loginLoading.value = true
  humanLogin(userName.value, localStorage.equipmentCode).then(({ data }: any) => {
    if (data.code == 200) {
      loginUser.value = userName.value
      localStorage.username = userName.value
      userName.value = ''
      loginOpen.value = false
      location.reload();
    } else {
      message.error({
        content: `操作失败请联系管理员${data.msg}`,

      })
    }
  }).catch((error: any) => {
    message.error({
      content: `操作失败请联系管理员${error}`,

    })
  }).finally(() => {
    loginLoading.value = false
  })
}

/**
 * 退出登录
 */
function logout() {
  humanLogout(userName.value, localStorage.equipmentCode).then(({ data }: any) => {
    if (data.code == 200) {
      loginUser.value = ''
      localStorage.username = ''
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
/**
 * 查询机台汇总信息
 */
function inquiryTable() {
  homePageLoading.value = true;
  getHomepage(localStorage.equipmentCode).then(({ data }) => {
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
      if (!userMessage.value.userName) {
        localStorage.removeItem('username')
        loginUser.value = undefined;
      }
      equipMessage.value = equipStatusDTOs
      sheetMessage.value = sheetStatusDTOs[0]
      workstationMessage.value = workstationSetRecord
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
            <a-button v-if="!loginUser" style="position:absolute; right: 1em;" type="primary" @click="loginOpen = true;userName = ''">
              人员切换
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


        <div class="work_order_information">
          <a-descriptions>
            <a-descriptions-item :span="1" label="工单号">
              {{ sheetMessage ? sheetMessage.workSheetCode : ''}}
            </a-descriptions-item>
            <a-descriptions-item :span="1" label="产品名称">
              {{ sheetMessage ? sheetMessage.productName : ''}}
            </a-descriptions-item>
            <a-descriptions-item :span="1" label="产品编号">
              {{ sheetMessage ? sheetMessage.productCode : ''}}
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
              />
            </a-tab-pane>
          </a-tabs>
        </a-card>
      </a-space>
    </a-spin>

    <!-- 用户登录 -->
    <a-modal v-model:open="loginOpen" title="用户登录" :maskClosable="false" style="min-width: 80%;">
      <template #footer>
        <a-button key="back" @click="loginOpen = false">取消</a-button>
        <a-button key="submit" :disabled="!userName" :loading="loginLoading" type="primary" @click="login">登录
        </a-button>
      </template>
      <label>
        用户名: &nbsp;&nbsp;
        <a-input v-model:value="userName" style="width: 70%" />
      </label>
    </a-modal>
<!--  工单切换不需要了  -->
<!--    <work-order-switching :workstationMessage="workstationMessage" v-if="workstationMessage"/>-->
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
