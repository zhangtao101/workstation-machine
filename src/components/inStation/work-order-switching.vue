<script setup lang="ts">
import { SwapOutlined } from '@ant-design/icons-vue'
import { onMounted, reactive, ref, watch } from 'vue'
import { getWorksheetListByWorkstationCode, inputSmkWorksheet } from '@/services/workstation.service'
import { message } from 'ant-design-vue'

const prop = defineProps({
  workstationMessage: {
    type: Object,
    required: true,
  }
});

// region 状态切换
// 是否隐藏
const isHidden = ref(true);
// 用于跟踪事件监听器是否已添加
const isListenerAdded = ref(false);

const fun = (event: any) => {
  const element = document.getElementById('target-element');
  // 检查点击的目标是否在目标元素或其子元素之外
  if (!element!.contains(event.target)) {
    console.log('点击在元素外部');
    // 执行需要的操作
    document.removeEventListener('click', fun);
    isHidden.value = true;
    isListenerAdded.value = false;
  } else {
    isHidden.value = false;
  }
}

/**
 * 切换状态
 */
function fnSwitchingStates() {
  isHidden.value = false;
  if (!isHidden.value && !isListenerAdded.value) {
    document.addEventListener('click', fun);
    isListenerAdded.value = true;
  }
}
// endregion

// region 工单变更
const open = ref(false);
const radioStyle = reactive({
  display: 'flex',
  lineHeight: '30px',
});
const selectWorkOrder = ref();
const productList = ref<any>([]);
const productListLoading = ref<any>(false);

/**
 * 查询工单列表
 */
function queryProductList() {
  productListLoading.value = true;
  getWorksheetListByWorkstationCode(prop.workstationMessage.workstationCode).then(({ data: {code, data, msg} }) => {
    if (code == 200) {
      productList.value = []
      data.forEach((item: any) => {
        productList.value.push({
          label: `${item.workSheetCode}-${item.productCode}-${item.productName}`,
          value: item.workSheetCode
        })
      })
    } else {
      message.error(`操作失败请联系管理员${msg}`)
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
  }).finally(() => {
    productListLoading.value = false;
  })
}

const pullInLoading = ref(false);
/**
 * 进站
 */
function pullIn() {
  pullInLoading.value = true;
  inputSmkWorksheet({
    worksheetCode: selectWorkOrder.value,
    equipmentCode: prop.workstationMessage.workstationCode,
    createUser: localStorage.username,
  }).then(({ data: { code, msg } }) => {
    if (code == 200) {
      message.success('工单变更成功!');
      // 选中的工单
      localStorage.lockProductCode = selectWorkOrder.value;
      // 选中的工作站
      localStorage.equipmentCode = prop.workstationMessage.workstationCode;
      localStorage.equipmentName = prop.workstationMessage.workstationName;
      setTimeout(() => {
        location.reload();
      }, 200)
    } else {
      message.error(`操作失败请联系管理员--${msg}`)
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
  }).finally(() => {
    pullInLoading.value = false;
  })
}
// endregion

watch(
  () => prop.workstationMessage,
  () => {
    if (prop.workstationMessage.workstationCode) {
      queryProductList();
    }
  }
)

onMounted(() => {
  if (prop.workstationMessage.workstationCode) {
    queryProductList();
  }
})
</script>

<template>
  <a-button type="primary" @click="open = true;" :loading="productListLoading" style="margin-left: 1em;">
    工单切换
  </a-button>
<!--  <div id="target-element" :class="{
          switch_button: true,
          hidden: isHidden
        }"
       @click="fnSwitchingStates"
  >
    <a-tooltip title="切换状态">
      <a-button type="primary" size="large" @click="open = true;" :loading="productListLoading">
        <template #icon>
          <SwapOutlined />
        </template>
      </a-button>
    </a-tooltip>
  </div>-->

  <a-drawer
    v-model:open="open"
    :footer-style="{ textAlign: 'right' }"
    title="工单变更"
    placement="right"
  >
    <a-radio-group v-model:value="selectWorkOrder">
      <a-radio
        v-for="(item, index) of productList"
        :style="radioStyle"
        :value="item.value"
        :key="index"
      >{{ item.label }}</a-radio>
    </a-radio-group>

    <template #footer>
      <a-button style="margin-right: 8px" @click="open = false">取消</a-button>
      <a-button type="primary" @click="pullIn" :loading="pullInLoading">变更工单</a-button>
    </template>
  </a-drawer>


</template>

<style scoped lang="scss">
$lineWidth: 10px;
.switch_button {
  position: fixed;
  right: 1em;
  top: 50%;
  transform: translateY(-50%);

  &.hidden {
    right: -40px;
    cursor: pointer;
    &:before {
      content: '<';
      display: inline-block;
      background: blue;
      vertical-align: top;
      color: white;
      font-size: 25px;
      line-height: 40px;
      height: 40px;
      text-align: center;
      border-radius: 10px 0 0 10px;
    }
    &:hover {
      background: #5959ff;
      border-radius: 10px 0 0 10px;
    }
  }
}
</style>
