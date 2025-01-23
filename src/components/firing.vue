<script lang="ts" setup>

import { onMounted, ref } from 'vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { listWarehouseRecord, outWarehouseRecord } from '@/services/firing.service'
import { type VxeTablePropTypes } from 'vxe-pc-ui'
import { humanLogin, humanLogout } from '@/services/machine-summary.service'

// region 数据查询

// 查询参数
const queryParams = ref({} as any)

// 表格数据
const tableData = ref([] as any)
// 表格加载状态
const tableLoading = ref(false)
// 表格对象
const dataTable = ref()
// 编辑配置
const editConfig = ref<VxeTablePropTypes.EditConfig>({
  trigger: 'click',
  mode: 'cell'
})

/**
 * 查询表格数据
 */
function query() {
  const params = {
    ...queryParams.value,
    areaCode: 'JP',
  }
  tableLoading.value = true
  listWarehouseRecord(params).then(({ data: {code, data, msg} }) => {
    if (code == 200) {
      tableData.value = data
    } else {
      message.error(`操作失败请联系管理员${msg}`)
    }
  }).catch((err) => {
    message.error({
      content: `操作失败请联系管理员,${err.message ? err.message : err}`,

    })
  }).finally(() => {
    tableLoading.value = false
  })
}

/**
 * 出库
 * @param row
 * @param i
 */
function deliveryFromStorage(row: any, i: number = 0) {
  if (row.number) {
    const params=  {
      worksheetCode: row.worksheetCode,
      bindingId: '',
      batchCode: row.batchCode,
      number: row.number,
      packageNumber: 0,
      warehouseCode: 'JP',
      inUser: localStorage.username,
      workstationCode: localStorage.equipmentCode,
    };
    row.submitLoading = true;
    outWarehouseRecord(params).then(({ data }) => {
      if (data.code == 200) {
        message.success(`操作成功!`);
        query()
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
      row.submitLoading = false;
    });
  } else {
    if (i && i > 2) {
      message.error(`出库数量不能为空!`)
    } else {
      setTimeout(() => {
        deliveryFromStorage(row, i + 1);
      }, 300);
    }
  }
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
      message.error(`操作失败请联系管理员${data.msg}`
      )
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

onMounted(() => {
  query()
})
</script>

<template>
  <div class="container">
    <div>
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
    </div>
    <!--region 查询条件 -->
    <a-form layout="inline">
      <a-form-item label="料号" name="productCode">
        <a-input
          v-model:value="queryParams.productCode"
          placeholder="请输入料号"
        />
      </a-form-item>
      <a-form-item label="产品名称" name="productName">
        <a-input
          v-model:value="queryParams.productName"
          placeholder="请输入产品名称"
        />
      </a-form-item>
      <a-form-item label="批次号" name="batchCode">
        <a-input
          v-model:value="queryParams.batchCode"
          placeholder="请输入批次号"
        />
      </a-form-item>

      <a-form-item label="">
        <a-button type="primary" @click="query()">
          <template #icon>
            <SearchOutlined />
          </template>
          查询
        </a-button>
      </a-form-item>
    </a-form>
    <!-- endregion -->

    <!--region 表格 -->
    <div>
      <vxe-table
        ref="dataTable"
        :data="tableData"
        :loading="tableLoading"
        :edit-config="editConfig"
        border
        header-cell-class-name="table_head"
        height="300"
      >
        <vxe-column type="seq" width="60"></vxe-column>
        <vxe-column field="batchCode" min-width="140" title="批次号"></vxe-column>
        <vxe-column field="productCode" min-width="180" title="产品编号"></vxe-column>
        <vxe-column field="productName" min-width="180" title="产品名称"></vxe-column>
        <vxe-column field="worksheetCode" :edit-render="{name: 'VxeInput'}" min-width="160" title="工单号"></vxe-column>
        <vxe-column field="stockNumber" min-width="120" title="库存量"></vxe-column>
        <vxe-column field="unit" min-width="120" title="单位"></vxe-column>
        <vxe-column field="number" :edit-render="{name: 'VxeInput', props: { type: 'integer' }}" min-width="120" title="出库量"></vxe-column>
        <vxe-column min-width="120" title="操作" fixed="right">
          <template #default="{row}">
            <a-button type="link" @click="deliveryFromStorage(row)" :loading="row.submitLoading">出库</a-button>
          </template>
        </vxe-column>
      </vxe-table>
    </div>
    <!-- endregion -->

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
</template>

<style lang="scss" scoped>
.container {
  padding: 1em 5%;
  max-height: calc(100vh - 2em);
  overflow: auto;

  // 操作
  .operation {
    margin: 1em 0;

    & > * {
      margin: 0 .5em;
    }
  }

  // 底部操作
  .bottom_operation {
    border: 1px solid rgb(219, 200, 253);
    padding: 1em;
    margin-bottom: 5em;
    background: rgb(241, 233, 254);
    display: flex;
    justify-content: center;

    & > div {
      width: 95%;
    }

    label {
      width: 90px;
      display: inline-block;
      text-align: right;
      margin-right: 1em;
      line-height: 30px;
      vertical-align: top;

      &:after {
        content: ':';
        margin-left: .5em;
      }
    }

    span {
      line-height: 30px;
    }
  }

  ::v-deep(.table_head) {
    background-color: #1677ff;
    color: white;
  }

  ::v-deep(.ant-row) {
    margin-bottom: 1em;
  }
}

</style>
