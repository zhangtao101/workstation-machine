<script lang="ts" setup>
import { isNavigationFailure, NavigationFailureType, RouterView, useRoute, useRouter } from 'vue-router'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { h, onMounted, ref, watch } from 'vue'
import { MailOutlined } from '@ant-design/icons-vue'
import WorkstationSelection from '@/components/workstation-selection.vue'
import { message } from 'ant-design-vue'
import Login from '@/components/login.vue'
import { getCurrentUser } from '@/services/machine-summary.service'


dayjs.locale('zh-cn')

const router = useRouter()
const route = useRoute();


const items = ref([
  {
    key: '/',
    icon: () => h(MailOutlined),
    label: '生产派工',
    title: '生产派工'
  },
  /*{
    key: 'dispatchCalendar',
    icon: () => h(MailOutlined),
    label: '生产日历查询',
    title: '生产日历查询',
  },*/
 /* {
    key: 'machineSummary',
    icon: () => h(MailOutlined),
    label: '工作站汇总',
    title: '工作站汇总'
  },*/
  /*{
    key: 'feed',
    icon: () => h(MailOutlined),
    label: '投料作业',
    title: '投料作业'
  },
  {
    key: 'layingOff',
    icon: () => h(MailOutlined),
    label: '下料作业',
    title: '下料作业'
  },*/
  /*{
    key: 'mixing',
    icon: () => h(MailOutlined),
    label: '混料作业',
    title: '混料作业',
  },
  {
    key: 'samplingOperation',
    icon: () => h(MailOutlined),
    label: '取样作业',
    title: '取样作业',
  },*/
  {
    key: 'sopView',
    icon: () => h(MailOutlined),
    label: 'SOP查看',
    title: 'SOP查看'
  },
  {
    key: 'workRderInStation',
    icon: () => h(MailOutlined),
    label: '工单进站',
    title: '工单进站'
  },
  {
    key: 'workRderOutStation',
    icon: () => h(MailOutlined),
    label: '工单出站',
    title: '工单出站'
  },
  /*{
    key: 'exceptionHandling',
    icon: () => h(MailOutlined),
    label: '异常处理',
    title: '异常处理'
  },
  {
    key: 'processMaintenance',
    icon: () => h(MailOutlined),
    label: '工序维护',
    title: '工序维护'
  },
  {
    key: 'processParameterTemplateMaintenance',
    icon: () => h(MailOutlined),
    label: '工艺参数模板维护',
    title: '工艺参数模板维护'
  },
  {
    key: 'processRoute',
    icon: () => h(MailOutlined),
    label: '工艺路线维护',
    title: '工艺路线维护'
  },*/
  {
    key: 'nonProductionReporting',
    icon: () => h(MailOutlined),
    label: '非生产上报',
    title: '非生产上报'
  }
])
// 是否折叠
const collapsed = ref<boolean>(false)

/**
 * 路由跳转
 */
async function skipRouter({ item, key, selectedKeys }: any) {
  document.title = item.title
  const navigationResult = await router.push(`/${key}`);
  if (isNavigationFailure(navigationResult, NavigationFailureType.aborted)) {
    console.log(navigationResult)
  }
}

const isShow = ref(false);
const path = ref('')

watch(
  () => route.path,
  () => {
    path.value = route.path;
  }
);
const userNmae = ref('');
onMounted(() => {
  userNmae.value = localStorage.getItem('username') || '';
  path.value = route.path;
  isShow.value = !!localStorage.getItem('equipmentCode');
  const equipmentName = localStorage.getItem('equipmentName');
  if (equipmentName?.includes('烧成')) {
    items.value.push({
      key: 'firing',
      icon: () => h(MailOutlined),
      label: '出库',
      title: '出库'
    });
    items.value.push({
      key: 'inventoryReplenishment',
      icon: () => h(MailOutlined),
      label: '入库补录',
      title: '入库补录'
    });
  }
  else if (equipmentName?.includes('打包')) {
    items.value.push({
      key: 'inventoryView',
      icon: () => h(MailOutlined),
      label: '库存查看',
      title: '库存查看'
    });
    items.value.push({
      key: 'inventoryReplenishment',
      icon: () => h(MailOutlined),
      label: '入库补录',
      title: '入库补录'
    });
  }
  else if (equipmentName?.includes('抛光') || equipmentName?.includes('湿磨')) {
    items.value.push({
      key: 'inventoryView',
      icon: () => h(MailOutlined),
      label: '查看中间库库存',
      title: '查看中间库库存'
    });
  }
  else if (equipmentName?.includes('施釉')) {
    items.value.push({
      key: 'inventoryView',
      icon: () => h(MailOutlined),
      label: '库存查看',
      title: '库存查看'
    });
  }
  else if (equipmentName?.includes('制浆')) {
    items.value.push({
      key: 'materialMovement',
      icon: () => h(MailOutlined),
      label: '浆料移动',
      title: '浆料移动'
    });
    items.value.push({
      key: 'inventoryView',
      icon: () => h(MailOutlined),
      label: '库存查看',
      title: '库存查看'
    });
  }
  else if (equipmentName?.includes('制粉')) {
    items.value.push({
      key: 'materialMovement',
      icon: () => h(MailOutlined),
      label: '粉料移动',
      title: '粉料移动'
    });
    items.value.push({
      key: 'warehouse',
      icon: () => h(MailOutlined),
      label: '料仓库存查看',
      title: '料仓库存查看'
    });
    items.value.push({
      key: 'materialConfirmation',
      icon: () => h(MailOutlined),
      label: '压机工单用料确认',
      title: '压机工单用料确认'
    });
  }
  else if (equipmentName?.includes('制釉')) {
    items.value.push({
      key: 'materialMovement',
      icon: () => h(MailOutlined),
      label: '浆料移动',
      title: '浆料移动'
    });
    items.value.push({
      key: 'inventoryView',
      icon: () => h(MailOutlined),
      label: '库存查看',
      title: '库存查看'
    });
  }
  else if (equipmentName?.includes('制色')) {
    items.value.push({
      key: 'color',
      icon: () => h(MailOutlined),
      label: '色料库存查看',
      title: '色料库存查看'
    });
  }
  else if (equipmentName?.includes('卧干')) {
    items.value.push({
      key: 'inventoryReplenishment',
      icon: () => h(MailOutlined),
      label: '入库补录',
      title: '入库补录'
    });
  }
  message.config({
    maxCount: 3,
    duration: 12,
    prefixCls: 'my-message',
  });
})

</script>

<template>
  <a-config-provider :locale="zhCN">
    <a-layout style="min-height: 100vh; width: 100vw; overflow: hidden;" v-if="userNmae">
      <a-layout-sider v-model:collapsed="collapsed" collapsible>
        <a-menu
          :items="items"
          mode="vertical"
          theme="dark"
          @select="skipRouter"
        ></a-menu>
      </a-layout-sider>
      <a-layout>
        <a-layout-header style="background: #fff; padding: 0" />
        <a-layout-content style="margin: 0 16px">
          <RouterView v-if="isShow || path === '/workRderInStation'"/>
          <workstation-selection v-else/>
        </a-layout-content>
      </a-layout>
    </a-layout>
    <login v-else />
  </a-config-provider>
</template>

<style>
body {
  overflow-x: hidden;
}

.my-message-notice {
  font-size: 24px;
}
.my-message-notice svg {
  width: 24px;
  height: 24px;
}
</style>
