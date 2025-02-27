<script lang="ts" setup>

import dayjs from 'dayjs'
import { onMounted, ref } from 'vue'
import { getHomepage, humanLogin, humanLogout } from '@/services/machine-summary.service'
import { message } from 'ant-design-vue'
import { listWorksheetByIp } from '@/services/sop-query.service'
import QrcodeVue from 'qrcode.vue'

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
          workLocation,
          totalNumber,
          totalDefectNumber,
          totalQualityNumber
        }
      } = data
      userMessage.value = {
        ...user,
        totalNumber,
        workLocation,
        totalDefectNumber,
        totalQualityNumber
      }
      // if (!userMessage.value.userName) {
      //   localStorage.removeItem('username')
      //   loginUser.value = undefined;
      // }
      equipMessage.value = equipStatusDTOs[0]
      sheetMessage.value = sheetStatusDTOs[0]
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

// region 生成标签
// 标签信息
const labelInformation = ref({} as any)
const showLabelMod = ref(false)

/**
 * 显示标签预览
 */
function showLabel() {
  showLabelMod.value = true
}

/**
 * 关闭
 */
function close() {

  labelInformation.value = {}
  showLabelMod.value = false
}

// endregion

// region 工单信息获取
// 工单列表
const worksheetList = ref([] as any[])
// 选中的工单号
const selectedWorkSheet = ref()

/**
 * 查询工单列表
 */
function queryWorkSheet() {
  listWorksheetByIp().then(({ data: { code, msg, data: d } }) => {
    if (code === 200) {
      worksheetList.value = d
    } else {
      message.error({
        content: `操作失败请联系管理员${msg}`,

      })
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
  queryWorkSheet()
  loginUser.value = localStorage.username
})
</script>

<template>
  <a-spin :spinning="homePageLoading">
    <div class="container">
      <h3>
        当前工作站: {{ userMessage?.workLocation }}
        <a-button v-if="userMessage?.workLocation" type="primary" @click="workStationChange">
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
      <a-descriptions>
        <a-descriptions-item label="人员">{{ userMessage?.userName }}</a-descriptions-item>
        <a-descriptions-item label="工号">{{ userMessage?.userCode }}</a-descriptions-item>
        <a-descriptions-item label="登入时间">{{ dayjs(userMessage?.opTime).format('YYYY-MM-DD HH:mm:ss') }}
        </a-descriptions-item>
      </a-descriptions>

      <div class="work_order_information">
        <a-descriptions>
          <a-descriptions-item :span="2" label="工单号">
            <a-select v-model:value="selectedWorkSheet" style="width: 320px">
              <a-select-option v-for="item of worksheetList" :key="item.id" :value="item.workSheetCode">
                {{ item.workSheetCode }}
              </a-select-option>
            </a-select>
          </a-descriptions-item>
          <a-descriptions-item label="设备号">
            <a-input v-model:value="equipMessage.equipCode" readonly />
          </a-descriptions-item>
          <a-descriptions-item label="设备编号">{{ equipMessage ? equipMessage.equipCode : '' }}</a-descriptions-item>
          <a-descriptions-item label="设备名称">{{ sheetMessage ? sheetMessage.workSheetCode : '' }}</a-descriptions-item>
        </a-descriptions>
      </div>
      <div class="laying_off">
        <h3>下料</h3>
        <a-descriptions :column="2">
          <a-descriptions-item label="物料批次">
            <a-input v-model:value="labelInformation.lot" />
          </a-descriptions-item>
          <a-descriptions-item label="物料编号">
            <a-input v-model:value="labelInformation.num" />
          </a-descriptions-item>
          <a-descriptions-item label="物料名称">
            <a-input v-model:value="labelInformation.name" />
          </a-descriptions-item>
          <a-descriptions-item label="下料数量">
            <a-input-number :min="0" v-model:value="labelInformation.quantity" />
          </a-descriptions-item>
        </a-descriptions>
        <a-button :disabled="!(labelInformation.lot && labelInformation.num && labelInformation.name && labelInformation.quantity)" type="primary"
                  @click="showLabel">
          生成标签
        </a-button>
      </div>

      <!-- 标签打印 -->
      <a-modal v-model:open="showLabelMod" title="标签打印" @cancel="close">
        <a-card id="printMe" style="width: 450px">
          <a-row>
            <a-col :span="18">
              <a-descriptions :column="2">
                <a-descriptions-item label="物料批次">{{ labelInformation.lot }}</a-descriptions-item>
                <a-descriptions-item label="物料编号">{{ labelInformation.num }}</a-descriptions-item>
                <a-descriptions-item label="物料名称">{{ labelInformation.name }}</a-descriptions-item>
                <a-descriptions-item label="下料数量">{{ labelInformation.quantity }}</a-descriptions-item>
              </a-descriptions>
            </a-col>
            <a-col :span="6">
              <qrcode-vue :size="100" :value="JSON.stringify(labelInformation)" level="H" />
            </a-col>
          </a-row>
        </a-card>
        <template #footer>
          <a-button @click="close">取消</a-button>
          <a-button v-print="'#printMe'" type="primary">打印</a-button>
        </template>
      </a-modal>
    </div>
  </a-spin>
</template>

<style lang="scss" scoped>
.container {
  padding: .2em 1em;

  .work_order_information {
    background: #efefef;
    border-radius: 1em;
    box-sizing: border-box;
    padding: 1em 1em 0 1em;
  }

  .laying_off {
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
