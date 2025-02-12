<script lang="ts" setup>

import dayjs from 'dayjs'
import { Chart } from '@antv/g2'
import { onMounted, ref, watch } from 'vue'
import { getHomepage, getQualityHomepage, humanLogin, humanLogout } from '@/services/machine-summary.service'
import { message } from 'ant-design-vue'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons-vue'

// region 机台汇总
// 人员信息
const userMessage = ref({} as any)
// 设备列表
const equipList = ref([] as any[])
// 设备列表
const productionEquipmentList = ref([] as any[])
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
      if (!userMessage.value.userName) {
        localStorage.removeItem('username')
        loginUser.value = undefined;
      }
      equipList.value = equipStatusDTOs ?? []
      productionEquipmentList.value = sheetStatusDTOs ?? []
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

/**
 * 格式化点检状态
 * @param cellValue
 */
function formatterCheckStatus({ cellValue }: any) {
  switch (cellValue) {
    case 0:
      return '未点检'
    case 1:
      return '已点检'
  }
}

/**
 * 格式化保养状态
 * @param cellValue
 */
function formatterMaintenanceStatus({ cellValue }: any) {
  switch (cellValue) {
    case 0:
      return '未保养'
    case 1:
      return '已保养'
  }
}

/**
 * 格式化状态
 * @param cellValue
 */
function formatterStatus({ cellValue }: any) {
  switch (cellValue) {
    case 0:
      return '停机'
    case 1:
      return '运行'
    case 2:
      return '待机'
  }
}

/**
 * 格式化标记
 * @param cellValue
 */
function formatterFlag({ cellValue }: any) {
  switch (cellValue) {
    case 0:
      return '未检'
    case 1:
      return '已检'
    default:
      return '不需要检验'
  }
}

// endregion

// region 质量汇总
// 不良项占比图标对象
const theProportionOfBadItemsChart = ref()

const theProportionOfBadItems = ref()

/**
 * 不良项占比
 */
function theProportionOfBadItemsInit(data: any[] = []) {
  if (data.length === 0) return
  if (!theProportionOfBadItemsChart.value) {
    theProportionOfBadItemsChart.value = new Chart({
      container: theProportionOfBadItems.value,
      autoFit: true,
      height: 350,
      padding: 20
    })

    theProportionOfBadItemsChart.value.coordinate('theta', {
      radius: 0.75
    })

    theProportionOfBadItemsChart.value.scale('percent', {
      formatter: (val: any) => {
        val = val * 100 + '%'
        return val
      }
    })
    theProportionOfBadItemsChart.value.tooltip({
      showTitle: false,
      showMarkers: false
    })

    theProportionOfBadItemsChart.value
      .interval()
      .position('count')
      .color('item')
      .label('count', {
        layout: [{ type: 'limit-in-plot', cfg: { action: 'ellipsis' } }],
        content: (data: any) => {
          return `${data.item}: ${data.percent * 100}%`
        }
      })
      .adjust('stack')

    theProportionOfBadItemsChart.value.interaction('element-active')
  }
  console.log(theProportionOfBadItemsChart.value)

  theProportionOfBadItemsChart.value.data(data)

  theProportionOfBadItemsChart.value.render()
}

// 生产批合格率图表对象
const productionPassRateChart = ref()
const productionPassRate = ref()

/**
 * 生产批合格率
 */
function productionPassRateInit(qualityStatistics: any[] = []) {
  if (qualityStatistics.length === 0) return
  if (!productionPassRateChart.value) {
    productionPassRateChart.value = new Chart({
      container: productionPassRate.value,
      autoFit: true,
      height: 350,
      padding: 'auto'
    })
    productionPassRateChart.value.scale({
      qualityNumber: {
        min: 0,
        nice: true
      }
    })

    productionPassRateChart.value.interval().position('workSheetCode*qualityNumber')
    // productionPassRateChart.value.point().position('year*value');

  }

  productionPassRateChart.value.data(qualityStatistics)

  productionPassRateChart.value.render()
}

const qualityUserInformation = ref({} as any)

/**
 * 查询质量数据
 */
function getQualityHomepageFun() {
  getQualityHomepage().then(({ data }: any) => {
    if (data.code == 200) {
      const {
        data: {
          user,
          defectRateDTOs,
          sheetQualityDTOs,
          workLocation,
          totalNumber,
          totalDefectNumber,
          totalQualityNumber
        }
      } = data
      qualityUserInformation.value = {
        ...user,
        totalNumber,
        workLocation,
        totalDefectNumber,
        totalQualityNumber
      }
      // 获取不合格项
      const defectiveProducts: any[] = []
      if (defectRateDTOs) {
        for (let item of defectRateDTOs) {
          defectiveProducts.push({
            item: item.defectName,
            count: item.defectNumber,
            percent: item.rate / 100
          })
        }
      }
      setTimeout(() => {
        theProportionOfBadItemsInit(defectiveProducts)
        productionPassRateInit(sheetQualityDTOs)
      }, 500)
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
      activeKeyChange(activeKey.value)
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

// 当前活跃的选项
const activeKey = ref('1')

function activeKeyChange(key: string) {
  switch (activeKey.value) {
    case '1':
      inquiryTable()
      break
    case '2':
      getQualityHomepageFun()
      break
    case '3':
      break
    default:
      break
  }
}

watch(activeKey, () => {
  activeKeyChange(activeKey.value)
})
onMounted(() => {
  inquiryTable()
  loginUser.value = localStorage.username
})
</script>

<template>
  <div class="container">
    <a-spin :spinning="homePageLoading">
      <a-tabs v-model:active-key="activeKey">
        <!-- region 机台汇总 -->
        <a-tab-pane key="1" tab="机台">
          <h2>当前信息: </h2>
          <a-descriptions>
            <a-descriptions-item label="人员">{{ userMessage?.userName }}</a-descriptions-item>
            <a-descriptions-item label="工号">{{ userMessage?.userCode }}</a-descriptions-item>
            <a-descriptions-item label="登入时间">{{ dayjs(userMessage?.opTime).format('YYYY-MM-DD HH:mm:ss') }}
            </a-descriptions-item>
            <a-descriptions-item label="今日产量">{{ userMessage.totalNumber }}</a-descriptions-item>
            <a-descriptions-item label="今日良品数">{{ userMessage.totalQualityNumber }}</a-descriptions-item>
            <a-descriptions-item label="今日不良品数">{{ userMessage.totalDefectNumber }}</a-descriptions-item>
          </a-descriptions>
          <div class="listDetails">
            <div>
              <h2>设备列表: </h2>
              <vxe-table
                :data="equipList">
                <vxe-column min-width="50" type="seq"></vxe-column>
                <vxe-column field="equipCode" min-width="120" title="设备编号"></vxe-column>
                <vxe-column :formatter="formatterStatus" field="status" min-width="60" title="状态"></vxe-column>
                <vxe-column field="runtime" min-width="120" title="运行时长(小时)"></vxe-column>
                <vxe-column field="utilizationRate" min-width="90" title="生产稼动率"></vxe-column>
                <vxe-column :formatter="formatterCheckStatus" field="checkStatus" min-width="90"
                            title="点检状态"></vxe-column>
                <vxe-column :formatter="formatterMaintenanceStatus" field="maintenanceStatus" min-width="90"
                            title="保养状态"></vxe-column>
              </vxe-table>
            </div>
            <div>
              <h2>生产列表: </h2>
              <!--  productionEquipmentList          -->
              <vxe-table
                :data="productionEquipmentList">
                <vxe-column min-width="60" type="seq"></vxe-column>
                <vxe-column field="workSheetCode" min-width="120" title="工单号"></vxe-column>
                <vxe-column field="productCode" min-width="120" title="产品型号"></vxe-column>
                <vxe-column field="productName" min-width="120" title="产品名称"></vxe-column>
                <vxe-column field="workPlanNumber" min-width="120" title="工单计划数量"></vxe-column>
                <vxe-column field="finishNumber" min-width="120" title="工单完工数量"></vxe-column>
                <vxe-column :formatter="formatterFlag" field="firstQualityFlag" min-width="60" title="首检">
                  <template #default="{ row }">
                    <CheckOutlined v-if="row.firstQualityFlag == 1" style="color: green; font-size: 24px;" />
                    <CloseOutlined v-if="row.firstQualityFlag == 0" style="color: red; font-size: 24px;" />
                  </template>
                </vxe-column>
                <vxe-column :formatter="formatterFlag" field="patrolQualityFlag" min-width="60" title="巡检">
                  <template #default="{ row }">
                    <CheckOutlined v-if="row.patrolQualityFlag == 1" style="color: green; font-size: 24px;" />
                    <CloseOutlined v-if="row.patrolQualityFlag == 0" style="color: red; font-size: 24px;" />
                  </template>
                </vxe-column>
                <vxe-column :formatter="formatterFlag" field="selfQualityFlag" min-width="60" title="自检">
                  <template #default="{ row }">
                    <CheckOutlined v-if="row.selfQualityFlag == 1" style="color: green; font-size: 24px;" />
                    <CloseOutlined v-if="row.selfQualityFlag == 0" style="color: red; font-size: 24px;" />
                  </template>
                </vxe-column>
                <vxe-column :formatter="formatterFlag" field="lastQualityFlag" min-width="60" title="末检">
                  <template #default="{ row }">
                    <CheckOutlined v-if="row.lastQualityFlag == 1" style="color: green; font-size: 24px;" />
                    <CloseOutlined v-if="row.lastQualityFlag == 0" style="color: red; font-size: 24px;" />
                  </template>
                </vxe-column>

                <vxe-column field="finishRate" min-width="100" title="完成进度(%)"></vxe-column>
              </vxe-table>
            </div>
          </div>
        </a-tab-pane>
        <!-- endregion -->
        <!-- region 质量汇总 -->
        <a-tab-pane key="2" tab="质量">
          <h2>当前信息: </h2>
          <a-descriptions>
            <a-descriptions-item label="人员">{{ qualityUserInformation?.userName }}</a-descriptions-item>
            <a-descriptions-item label="工号">{{ qualityUserInformation?.userCode }}</a-descriptions-item>
            <a-descriptions-item label="登入时间">
              {{ dayjs(qualityUserInformation?.opTime).format('YYYY-MM-DD HH:mm:ss') }}
            </a-descriptions-item>
            <a-descriptions-item label="今日产量">{{ qualityUserInformation.totalNumber }}</a-descriptions-item>
            <a-descriptions-item label="今日良品数">{{ qualityUserInformation.totalQualityNumber }}</a-descriptions-item>
            <a-descriptions-item label="今日不良品数">{{ qualityUserInformation.totalDefectNumber }}</a-descriptions-item>
          </a-descriptions>
          <div class="listDetails">
            <!--          不良项占比-->
            <div id="theProportionOfBadItems" ref="theProportionOfBadItems">
              <h2>不良项占比</h2>
              <h3 v-if="!theProportionOfBadItemsChart">暂无数据</h3>
            </div>
            <!--         生产批合格率 -->
            <div id="productionPassRate" ref="productionPassRate">
              <h2>工单质量统计</h2>
              <h3 v-if="!productionPassRateChart">暂无数据</h3>
            </div>
          </div>
        </a-tab-pane>
        <!-- endregion -->
        <!-- region 物料汇总 -->
        <a-tab-pane key="3" tab="物料">
          <h2>当前信息: </h2>
          <a-descriptions>
            <a-descriptions-item label="人员">张三</a-descriptions-item>
            <a-descriptions-item label="工号">1234567</a-descriptions-item>
            <a-descriptions-item label="登入时间">{{ dayjs().format('YYYY-MM-DD HH:mm:ss') }}</a-descriptions-item>
            <a-descriptions-item label="今日产量">99999</a-descriptions-item>
            <a-descriptions-item label="今日良品数">0</a-descriptions-item>
            <a-descriptions-item label="今日不良品数">0</a-descriptions-item>
          </a-descriptions>
        </a-tab-pane>
        <!-- endregion -->
        <template #rightExtra>
      <span class="workStation">
        当前工作站: {{ userMessage?.workLocation }}
      </span>

          <a-button v-if="!loginUser" type="primary" @click="loginOpen = true;userName = ''"> 人员切换</a-button>
          <a-popconfirm
            v-if="loginUser"
            cancel-text="取消"
            ok-text="退出"
            placement="leftTop"
            title="是否确认退出登录?"
            @confirm="logout"
          >
            <a-button type="primary"> 退出登录</a-button>
          </a-popconfirm>
        </template>
      </a-tabs>
    </a-spin>
  </div>

  <!-- 用户登录 -->
  <a-modal v-model:open="loginOpen" title="用户登录" :maskClosable="false" style="min-width: 80%;">
    <template #footer>
      <a-button key="back" @click="loginOpen = false">取消</a-button>
      <a-button key="submit" :disabled="!userName" :loading="loginLoading" type="primary" @click="login">登录</a-button>
    </template>
    <label>
      用户名: &nbsp;&nbsp;
      <a-input v-model:value="userName" style="width: 70%" />
    </label>
  </a-modal>
</template>

<style lang="scss" scoped>
.container {
  padding: .2em 1em;
  height: calc(100vh - 70px);
  overflow-y: auto;

  .workStation {
    font-size: 18px;
    margin-right: 3em;
  }

  .listDetails {
    display: flex;
    flex-wrap: wrap;

    & > div {
      flex: 1;
      min-width: 500px;
      margin: 0 .5em;
      height: 400px;
    }
  }
}
</style>
