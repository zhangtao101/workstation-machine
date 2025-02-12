<script lang="ts" setup>

import dayjs from 'dayjs'
import { Chart } from '@antv/g2'
import { onMounted, ref } from 'vue'
import { getHomepage, humanLogin, humanLogout } from '@/services/machine-summary.service'
import { message, Modal } from 'ant-design-vue'


// region 机台汇总
// 人员信息
const userMessage = ref({} as any)
// 设备列表
const equipList = ref([] as any[])
// 设备列表
const productionEquipmentList = ref([] as any[])
// 当前选中的设备
const selectedEquip = ref();
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



/**
 * 表格行点击后, 初始化图表
 * @param row
 */
function cellClickEvent({row}: any) {
  selectedEquip.value = row;
  setTimeout(() => {
    chartInit();
  }, 500)
}

// endregion

// region 图表初始化
// 温度数据
const temperatureData = ref([
  { "time": "00:00", "设定温度": 200, "实际温度": 190 },
  { "time": "00:30", "设定温度": 198, "实际温度": 188 },
  { "time": "01:00", "设定温度": 196, "实际温度": 186 },
  { "time": "01:30", "设定温度": 194, "实际温度": 184 },
  { "time": "02:00", "设定温度": 192, "实际温度": 182 },
  { "time": "02:30", "设定温度": 190, "实际温度": 180 },
  { "time": "03:00", "设定温度": 188, "实际温度": 178 },
  { "time": "03:30", "设定温度": 186, "实际温度": 176 },
  { "time": "04:00", "设定温度": 184, "实际温度": 174 },
  { "time": "04:30", "设定温度": 182, "实际温度": 172 },
  { "time": "05:00", "设定温度": 180, "实际温度": 170 },
  { "time": "05:30", "设定温度": 178, "实际温度": 168 },
  { "time": "06:00", "设定温度": 176, "实际温度": 166 },
  { "time": "06:30", "设定温度": 174, "实际温度": 164 },
  { "time": "07:00", "设定温度": 172, "实际温度": 162 },
  { "time": "07:30", "设定温度": 170, "实际温度": 160 },
  { "time": "08:00", "设定温度": 172, "实际温度": 162 },
  { "time": "08:30", "设定温度": 174, "实际温度": 164 },
  { "time": "09:00", "设定温度": 176, "实际温度": 166 },
  { "time": "09:30", "设定温度": 178, "实际温度": 168 },
  { "time": "10:00", "设定温度": 180, "实际温度": 170 },
  { "time": "10:30", "设定温度": 182, "实际温度": 172 },
  { "time": "11:00", "设定温度": 184, "实际温度": 174 },
  { "time": "11:30", "设定温度": 186, "实际温度": 176 },
  { "time": "12:00", "设定温度": 188, "实际温度": 178 },
  { "time": "12:30", "设定温度": 190, "实际温度": 180 },
  { "time": "13:00", "设定温度": 192, "实际温度": 182 },
  { "time": "13:30", "设定温度": 194, "实际温度": 184 },
  { "time": "14:00", "设定温度": 196, "实际温度": 186 },
  { "time": "14:30", "设定温度": 198, "实际温度": 188 },
  { "time": "15:00", "设定温度": 200, "实际温度": 190 }
]);
// 图表数据
const data = ref<any>([
    { "time": "00:00", "type": "设定温度", "value": 200 },
    { "time": "00:00", "type": "实际温度", "value": 198 },
    { "time": "01:00", "type": "设定温度", "value": 202 },
    { "time": "01:00", "type": "实际温度", "value": 201 },
    { "time": "02:00", "type": "设定温度", "value": 204 },
    { "time": "02:00", "type": "实际温度", "value": 203 },
    { "time": "03:00", "type": "设定温度", "value": 205 },
    { "time": "03:00", "type": "实际温度", "value": 204 },
    { "time": "04:00", "type": "设定温度", "value": 207 },
    { "time": "04:00", "type": "实际温度", "value": 205 },
    { "time": "05:00", "type": "设定温度", "value": 209 },
    { "time": "05:00", "type": "实际温度", "value": 210 },
    { "time": "06:00", "type": "设定温度", "value": 211 },
    { "time": "06:00", "type": "实际温度", "value": 209 },
    { "time": "07:00", "type": "设定温度", "value": 213 },
    { "time": "07:00", "type": "实际温度", "value": 212 },
    { "time": "08:00", "type": "设定温度", "value": 215 },
    { "time": "08:00", "type": "实际温度", "value": 214 },
    { "time": "09:00", "type": "设定温度", "value": 217 },
    { "time": "09:00", "type": "实际温度", "value": 216 },
    { "time": "10:00", "type": "设定温度", "value": 219 },
    { "time": "10:00", "type": "实际温度", "value": 218 },
    { "time": "11:00", "type": "设定温度", "value": 220 },
    { "time": "11:00", "type": "实际温度", "value": 221 },
    { "time": "12:00", "type": "设定温度", "value": 222 },
    { "time": "12:00", "type": "实际温度", "value": 223 },
    { "time": "13:00", "type": "设定温度", "value": 224 },
    { "time": "13:00", "type": "实际温度", "value": 222 },
    { "time": "14:00", "type": "设定温度", "value": 226 },
    { "time": "14:00", "type": "实际温度", "value": 225 },
    { "time": "15:00", "type": "设定温度", "value": 227 },
    { "time": "15:00", "type": "实际温度", "value": 226 },
    { "time": "16:00", "type": "设定温度", "value": 229 },
    { "time": "16:00", "type": "实际温度", "value": 228 },
    { "time": "17:00", "type": "设定温度", "value": 230 },
    { "time": "17:00", "type": "实际温度", "value": 229 },
    { "time": "18:00", "type": "设定温度", "value": 228 },
    { "time": "18:00", "type": "实际温度", "value": 227 },
    { "time": "19:00", "type": "设定温度", "value": 226 },
    { "time": "19:00", "type": "实际温度", "value": 225 },
    { "time": "20:00", "type": "设定温度", "value": 224 },
    { "time": "20:00", "type": "实际温度", "value": 223 },
    { "time": "21:00", "type": "设定温度", "value": 222 },
    { "time": "21:00", "type": "实际温度", "value": 220 },
    { "time": "22:00", "type": "设定温度", "value": 220 },
    { "time": "22:00", "type": "实际温度", "value": 218 },
    { "time": "23:00", "type": "设定温度", "value": 218 },
    { "time": "23:00", "type": "实际温度", "value": 217 }
  ]
);
// 图表对象
const chart = ref<any>();

/**
 * 图表初始话
 */
function chartInit() {
  chart.value = new Chart({
    container: 'container',
    autoFit: true,
    height: 200
  });
  chart.value.data(data.value);

  chart.value.tooltip({
    showCrosshairs: true,
    shared: true,
  });
  chart.value.axis('value', {
    label: {
      formatter: (val: any) => {
        return val + ' °C';
      },
    },
  });

  chart.value
    .line()
    .position('time*value')
    .color('type')
    .shape('smooth');

  chart.value
    .point()
    .position('time*value')
    .color('type')
    .shape('circle');

  chart.value.render();
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
      inquiryTable()
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

// region 警告信息

const waringData = ref<any>([
    {
      "qrCode": "P1234567890",
      "message": "温度超出范围",
      "time": "2024-09-30 08:15:23"
    },
    {
      "qrCode": "P0987654321",
      "message": "设备未响应",
      "time": "2024-09-30 09:30:45"
    },
    {
      "qrCode": "P2345678901",
      "message": "电压异常",
      "time": "2024-09-30 10:12:01"
    },
    {
      "qrCode": "P3456789012",
      "message": "通信故障",
      "time": "2024-09-30 11:25:38"
    },
    {
      "qrCode": "P4567890123",
      "message": "传感器故障",
      "time": "2024-09-30 12:45:17"
    },
    {
      "qrCode": "P5678901234",
      "message": "电源中断",
      "time": "2024-09-30 14:03:59"
    },
    {
      "qrCode": "P6789012345",
      "message": "数据丢失",
      "time": "2024-09-30 15:47:22"
    }
  ]
);

// endregion


// region 按钮操作

/**
 * 停机
 */
function shutDown() {
  Modal.confirm({
    title: '操作确认',
    content: '是否确认停机?',
    onOk() {
      message.success('设备已成功停机!');
    },
    onCancel() {
      message.warning('已取消!');
    },
    class: 'test',
  });
}
/**
 * 启用
 */
function enable() {
  message.success('设备已成功启用!');
}
/**
 * 调机
 */
function debugEquipment() {
  message.success('设备已进入调机状态!');
}
/**
 * 复位
 */
function resetting() {
  message.success('设备已复位!');
}

// endregion



onMounted(() => {
  inquiryTable()
  loginUser.value = localStorage.username
})
</script>

<template>
  <a-spin :spinning="homePageLoading">
    <div class="container">
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
            border
            height="350"
            :data="equipList"
            @cell-click="cellClickEvent"
          >
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
          <h2>数据查看: </h2>
          <div v-if="selectedEquip">
            <div id="container">

            </div>
            <vxe-table
              border
              height="100"
              :data="temperatureData">
              <vxe-column min-width="60" type="seq"></vxe-column>
              <vxe-column field="time" min-width="120" title="时间"></vxe-column>
              <vxe-column field="设定温度" min-width="120" title="设定温度"></vxe-column>
              <vxe-column field="实际温度" min-width="120" title="实际温度"></vxe-column>
            </vxe-table>
          </div>
          <div v-else>
            <h3>请先选择具体的设备</h3>
          </div>
        </div>
      </div>
      <!-- 异常信息 -->
      <div>
        <vxe-table
          border
          height="160"
          :data="waringData"
          style="margin-top: 2em;"
        >
          <vxe-column min-width="50" type="seq"></vxe-column>
          <vxe-column field="qrCode" min-width="120" title="产品二维码"></vxe-column>
          <vxe-column field="message" min-width="120" title="异常信息"></vxe-column>
          <vxe-column field="time" min-width="90" title="时间"></vxe-column>
        </vxe-table>
      </div>
    </div>
    <!-- 按钮列表 -->
    <a-card :bordered="false" class="main-card">
      <div class="main-card-body">
        <a-button type="primary" danger @click="shutDown">停机</a-button>
        <a-button type="primary" style="background: #2cfd00;" @click="enable">启用</a-button>
        <a-button type="primary" style="background: #ff9900;" @click="debugEquipment">调机</a-button>
        <a-button type="primary" @click="resetting">复位</a-button>
      </div>
    </a-card>
  </a-spin>

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

.main-card {
  position: fixed;
  bottom: 1em;
  width: calc(100% - 230px);
  .main-card-body {
    display: flex;
    justify-content: space-around;
  }
}
</style>
