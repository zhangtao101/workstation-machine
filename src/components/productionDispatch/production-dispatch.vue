<script lang="ts" setup>

import { ref } from 'vue'
import ReassignmentOfWorkOrder from '@/components/productionDispatch/children/reassignment-of-work-order.vue'
import WorkOrderAssignment from '@/components/productionDispatch/children/work-order-assignment.vue'
import WorkOrderDisassemblyAndConsolidation
  from '@/components/productionDispatch/children/work-order-disassembly-and-consolidation.vue'

// 当前活跃的下标
const activeIndex = ref(1)

function activeChange(index: number) {
  activeIndex.value = index
}

// workOrderDisassemblyAndConsolidation  workOrderAssignment  reassignmentOfWorkOrder
</script>

<template>
  <main>
    <work-order-disassembly-and-consolidation v-if="activeIndex === 0" />
    <work-order-assignment v-if="activeIndex === 1" />
    <reassignment-of-work-order v-if="activeIndex === 2" />
  </main>

  <footer>
<!--    <div
      :class="{
        active: activeIndex === 0
      }"
      @click="activeChange(0)"
    >
      <i class="iconfont icon-liebiao footer_icon"></i>
      工单拆合并
    </div>-->
    <div
      :class="{
        active: activeIndex === 1
      }"
      @click="activeChange(1)"
    >
      <i class="iconfont icon-fasongxinxi footer_icon"></i>
      工单指派
    </div>
    <div
      :class="{
        active: activeIndex === 2
      }"
      @click="activeChange(2)"
    >
      <i class="iconfont icon-fenzhi- footer_icon"></i>工单改派
    </div>
  </footer>
</template>

<style lang="scss" scoped>
footer {
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;
  height: 2em;
  line-height: 2em;
  display: flex;
  justify-content: space-around;
  font-size: 18px;
  color: white;
  background: #91b8b8;
  border-radius: 8px;
  z-index: 99;

  .footer_icon {
    font-size: 18px;
    margin-right: 8px;
  }

  & > div {
    padding: 0 1em;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      color: rgba(255, 0, 0, 0.78);
    }
  }

  .active {
    color: red;
    border-bottom: 3px solid red;
  }
}
</style>
