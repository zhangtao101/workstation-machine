<script setup lang="ts">
import { h, ref } from 'vue'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons-vue'

// region 表格操作
// 表格数据

const tableData = ref<any>([{}]);

// region 查询
// 查询参数
const searchParams = ref<any>({});
// endregion

// endregion

// region 新增/编辑
// 抽屉是否打开
const isOpen = ref(false);
// 正在编辑的数据
const editData = ref<any>({  });
// 参数表格数据
const argumentTable = ref<any[]>([]);
// 参数类型数据
const argumentType = ref<any[]>([
  {
    label: '1',
    value: '1',
  },
  {
    label: '2',
    value: '2',
  },
  {
    label: '3',
    value: '3',
  },
]);
// 表格编辑配置
const editConfig = ref<any>({
  trigger: 'click',
  mode: 'cell'
})

/**
 * 新增参数表格单元行
 */
function addRow() {
  argumentTable.value.push({});
}

/**
 * 删除参数行
 * @param row 行数据
 * @param index 下标
 */
function delArgumentRow(row: any, index: number) {
  argumentTable.value.splice(index, 1);
  console.log(row, index);
}


/**
 * 抽屉状态变更时调用, 用来在关闭的时候设置初始状态
 * @param open
 */
function afterOpenChange(open: boolean) {
  if(!open) {
    editData.value = {};
  }
}

/**
 * 显示编辑抽屉
 * @param row
 */
function editItem(row: any) {
  isOpen.value = true;
  editData.value  = row;
  argumentTable.value = row.table ?? [];
}

// endregion

</script>

<template>

  <a-space :size="20" direction="vertical">
    <a-card style="margin-top: 2em;width: calc(100vw - 250px);">
      <a-form layout="inline" :model="searchParams">
        <a-form-item label="模板编号">
          <a-input v-model:value="searchParams.fieldA" placeholder="模板编号" />
        </a-form-item>
        <a-form-item label="模板名称">
          <a-input v-model:value="searchParams.fieldB" placeholder="模板名称" />
        </a-form-item>
        <a-form-item >
          <a-button type="primary">查询</a-button>
        </a-form-item>
      </a-form>
    </a-card>
    <a-card style="width: calc(100vw - 250px);">
      <!-- region 按钮集合 -->
      <div class="button-list">
        <a-button type="primary" @click="isOpen = true">新增</a-button>
      </div>
      <vxe-table
        border
        height="160"
        :data="tableData"
        style="margin-top: 2em;"
      >
        <vxe-column min-width="50" type="seq"></vxe-column>
        <vxe-column field="message" min-width="120" title="模板编号"></vxe-column>
        <vxe-column field="time1" min-width="90" title="模板名称"></vxe-column>
        <vxe-column field="time2" min-width="90" title="模板类型"></vxe-column>
        <vxe-column field="time3" min-width="90" title="所属工序"></vxe-column>
        <vxe-column field="time4" min-width="90" title="操作" fixed="right">
          <template #default="{row}">
            <a-space >
              <!-- 编辑 -->
              <a-button type="primary" :icon="h(EditOutlined)" @click="editItem(row)"/>
              <!-- 删除 -->
              <a-button type="primary" danger :icon="h(DeleteOutlined)" @click="deleteItem(row)" />
            </a-space>
          </template>
        </vxe-column>
      </vxe-table>
    </a-card>
  </a-space>

  <!-- 新增/编辑 -->
  <a-drawer
    v-model:open="isOpen"
    :footer-style="{ textAlign: 'right' }"
    :height="600"
    placement="top"
    title="基本信息编辑"
    @after-open-change="afterOpenChange"
  >
    <a-form layout="inline" :model="searchParams">
      <a-form-item label="模板编号" required>
        <a-input v-model:value="searchParams.fieldA" placeholder="模板编号" />
      </a-form-item>
      <a-form-item label="模板名称" required>
        <a-input v-model:value="searchParams.fieldB" placeholder="模板名称" />
      </a-form-item>
      <a-form-item label="模板类型" required>
        <a-input v-model:value="searchParams.fieldB" placeholder="模板类型" />
      </a-form-item>
      <a-form-item label="所属工序" required>
        <a-input v-model:value="searchParams.fieldB" placeholder="所属工序" />
      </a-form-item>
    </a-form>
    <a-button type="primary" @click="addRow">新增</a-button>
    <vxe-table
      :data="argumentTable"
      :edit-config="editConfig"
      border
      height="300"
      style="margin-top: 1em;"
    >
      <vxe-column min-width="50" type="seq"></vxe-column>
      <vxe-column field="message" min-width="120" title="参数编号" :edit-render="{name: 'input'}"></vxe-column>
      <vxe-column field="time1" min-width="90" title="参数名称" :edit-render="{name: 'input'}"></vxe-column>
      <vxe-column field="time2" min-width="90" title="参数类型" :edit-render="{name: 'VxeSelect', options: argumentType, immediate: true}">

      </vxe-column>
      <vxe-column field="time3" min-width="90" title="参数说明" :edit-render="{name: 'input'}"></vxe-column>
      <vxe-column field="time4" min-width="90" title="参数默认值" :edit-render="{name: 'input'}"></vxe-column>
      <vxe-column field="time5" min-width="90" title="阈值范围" :edit-render="{name: 'input'}"></vxe-column>
      <vxe-column min-width="90" title="操作" fixed="right">
        <template #default="{row, rowIndex}">
          <a-space >
            <a-popconfirm
              title="是否确认删除该条数据?"
              ok-text="是"
              cancel-text="否"
              @confirm="delArgumentRow(row, rowIndex)"
            >
              <a-button type="primary" danger :icon="h(DeleteOutlined)" />

            </a-popconfirm>
          </a-space>
        </template>
      </vxe-column>
    </vxe-table>

    <template #footer>
      <a-space>
        <a-button >取消</a-button>
        <a-button type="primary" >提交</a-button>
      </a-space>
    </template>
  </a-drawer>
</template>

<style scoped lang="scss">
:deep(.vxe-select.is--active:not(.is--filter)>.vxe-input .vxe-input--inner) {
  border: 0 !important;
}
</style>
