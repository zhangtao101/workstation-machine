<script lang="ts" setup>


import dayjs from 'dayjs'
import { onMounted, ref } from 'vue'
import { getHomepage, humanLogin, humanLogout } from '@/services/machine-summary.service'
import { message } from 'ant-design-vue'
import { listFileNameByWorksheetCode, listWorksheetByIp } from '@/services/sop-query.service'
import { BASE_URL } from '@/services/config'
//引入VueOfficeDocx组件
import VueOfficeDocx from '@vue-office/docx'
//引入相关样式
import '@vue-office/docx/lib/index.css'

//引入VueOfficeExcel组件
import VueOfficeExcel from '@vue-office/excel'
//引入相关样式
import '@vue-office/excel/lib/index.css'


//引入VueOfficePdf组件
import VueOfficePdf from '@vue-office/pdf'


import qs from 'qs'


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
// 加载状态
const homePageLoading = ref(false);

/**
 * 查询机台汇总信息
 */
function inquiryTable() {
  homePageLoading.value = true;
  getHomepage(localStorage.equipmentCode).then(({ data }) => {
    if (data.code == 200) {
      const { data: { user, workLocation, totalNumber, totalDefectNumber, totalQualityNumber } } = data
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

// 文件列表
const files = ref([] as any)

/**
 * 根据工单号查询文件列表
 */
function queryFiles() {
  if (selectedWorkSheet.value) {
    listFileNameByWorksheetCode(selectedWorkSheet.value).then(({ data: { code, msg, data: d } }) => {
      if (code === 200) {
        files.value = d
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
}

// endregion

// region 文件预览
// 文件抽屉是否显示
const isFileShow = ref(false)
// 文件类型
const fileType = ref(-1)
// 类型列表
const types = ref([
  {
    type: 1,
    name: [
      '.jpg',
      '.png',
      '.tif',
      '.gif',
      '.pcx',
      '.tga',
      '.exif',
      '.fpx',
      '.svg',
      '.psd',
      '.cdr',
      '.pcd',
      '.dxf',
      '.ufo',
      '.eps',
      '.ai',
      '.raw',
      '.WMF',
      '.webp',
      '.avif',
      '.apng'
    ]
  },
  {
    type: 2,
    name: ['.pdf']
  },
  {
    type: 3,
    name: [
      '.mp4',
      '.m4v',
      '.wmv',
      '.asx',
      '.asf',
      '.3gp',
      '.mov',
      '.avi',
      '.dat',
      '.mkv',
      '.flv',
      '.vob'
    ]
  },
  /*{
    type: 4,
    name: ['doc', 'docx']
  },*/
  {
    type: 5,
    name: ['xls', 'xlsx']
  }
])
// 文件路径
const fileUrl = ref()

/**
 * 显示文件详情抽屉
 * @param file
 */
function showDetails(file: any) {
  if (getType(file.fileName)) {
    isFileShow.value = true
    fileUrl.value = `${BASE_URL}process/productSop/download?${qs.stringify({
      id: file.id,
      fileName: file.fileName
    })}`
  } else {
    message.error(`该文件类型暂未定义展示方式, 请联系管理员后添加!`)
  }
}

/**
 * 获取类型, 未在定义的类型范围内返回false<nr/>
 * 并把视图类型变为初始值
 */
function getType(fileName: string) {
  // 获取类型
  for (let type of types.value) {
    for (let name of type.name) {
      if (fileName.endsWith(name)) {
        fileType.value = type.type
        return type.type
      }
    }
  }
  fileType.value = -1
  return false
}

// 需要全屏显示的元素
const el = ref()

/**
 * 切换全屏
 */
function toggleFullScreen() {
  if (!document.fullscreenElement &&
    el.value.requestFullscreen) {
    el.value.requestFullscreen()
      .catch((err: any) => {
        message.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`)
      })
  } else if (document.exitFullscreen) {
    document.exitFullscreen()
  }
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
      <a-descriptions>
        <a-descriptions-item label="人员">{{ userMessage?.userName }}</a-descriptions-item>
        <a-descriptions-item label="工号">{{ userMessage?.userCode }}</a-descriptions-item>
        <a-descriptions-item label="登入时间">{{ dayjs(userMessage?.opTime).format('YYYY-MM-DD HH:mm:ss') }}
        </a-descriptions-item>
      </a-descriptions>

      <div class="work_order_information">
        <a-descriptions>
          <a-descriptions-item :span="2" label="工单号">
            <a-select v-model:value="selectedWorkSheet" style="width: 320px" @change="queryFiles()">
              <a-select-option v-for="item of worksheetList" :key="item.id" :value="item.workSheetCode">
                {{ item.workSheetCode }}
              </a-select-option>
            </a-select>
          </a-descriptions-item>
        </a-descriptions>
      </div>

      <div class="material_information">
        <h3>明细查看</h3>
        <a-button v-for="item of files" :key="item.id" type="link" @click="showDetails(item)">{{ item.fileName }}
        </a-button>
      </div>

      <a-drawer
        v-model:open="isFileShow"
        :footer-style="{ textAlign: 'right' }"
        class="custom-class"
        height="800px"
        placement="top"
        title="资料查看"
      >

        <div ref="el">
          <div v-if="fileType == 1">
            <img :src="fileUrl" alt="图片信息">
          </div>
          <div v-if="fileType == 2">
            <vue-office-pdf
              :src="fileUrl"
              style="height: 100vh"
            />
          </div>
          <div v-if="fileType == 3">
            <video :src="fileUrl" />
          </div>
          <div v-if="fileType == 4">
            <vue-office-docx
              :src="fileUrl"
              style="height: 100%;"
            />
          </div>
          <div v-if="fileType == 5">
            <vue-office-excel
              :src="fileUrl"
              style="height: 100vh;"
            />
          </div>
        </div>

        <template #footer>
          <a-button style="margin-right: 8px" @click="isFileShow = false">取消</a-button>
          <a-button type="primary" @click="toggleFullScreen">全屏查看</a-button>
        </template>
      </a-drawer>


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
    padding: 1em;
  }

  .material_information {
    margin: 2em 0;
    background: #bfe5f8;
    border-radius: 1em;
    box-sizing: border-box;
    padding: 1em;
  }

  .operation {
    margin-top: 1em;
    display: flex;
    justify-content: space-between;
  }
}

:deep(.key_point_text) {
  .ant-descriptions-item-content {
    color: #091fb4 !important;
    font-weight: bold;
  }
}

:deep(.success_text) {
  .ant-descriptions-item-content {
    color: #2cfd00;
    font-weight: bold;
  }
}

:deep(.error_text) {
  .ant-descriptions-item-content {
    color: red;
    font-weight: bold;
  }
}

#xlsHtml {
  overflow: auto;
  max-height: 100vh;

  :deep(table) {
    width: 100%;
    border-collapse: collapse; /* 合并相邻的边框 */
    background: white;
  }

  :deep( td) {
    border: 1px solid black !important;
    min-height: 1em !important;
  }
}
</style>
