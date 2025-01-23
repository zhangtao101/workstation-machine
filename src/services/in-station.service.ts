import axios from 'axios'
import qs from 'qs'
import { BASE_URL } from '@/services/config'

/**
 * 工作站过程操作记录添加
 * @param params 参数
 */
export function processRecordReport(params: any) {
  return axios.post(`${BASE_URL}workstation/op/processRecordReport`, params)
}

/**
 * 查询BOM列表
 * @param equipCode 参数
 */
export function getBomMaterialListByCode(equipCode: any) {
  return axios.get(`${BASE_URL}human/patch/getBomMaterialListByCode?equipCode=${equipCode}`)
}
// region 领料
/**
 * 根据工单获取对应的砖坯批次号信息
 * @param worksheetCode 参数
 */
export function getBatchListByWorksheetCode(worksheetCode: any) {
  return axios.get(`${BASE_URL}workstation/op/getBatchListByWorksheetCode?worksheetCode=${worksheetCode}`)
}

/**
 * 领料
 * @param params 参数
 */
export function getMaterials(params: any) {
  return axios.post(`${BASE_URL}workstation/op/materialApply`, params)
}
/**
 * 领料
 * @param params 参数
 */
export function materialDBApply(params: any) {
  return axios.post(`${BASE_URL}workstation/op/materialDBApply`, params)
}
/**
 * 领料
 * @param params 参数
 */
export function materialFXApply(params: any) {
  return axios.post(`${BASE_URL}workstation/op/materialFXApply`, params)
}

// endregion

// region 入库
/**
 * 入库
 * @param params 参数
 */
export function worksheetInWarehouse(params: any) {
  return axios.post(`${BASE_URL}workstation/op/worksheetInWarehouse`, params)
}
/**
 * 入库
 * @param params 参数
 */
export function worksheetBCPInWarehouse(params: any) {
  return axios.post(`${BASE_URL}workstation/op/worksheetBCPInWarehouse`, params)
}
/**
 * 入库
 * @param params 参数
 */
export function worksheetDBInWarehouse(params: any) {
  return axios.post(`${BASE_URL}workstation/op/worksheetDBInWarehouse`, params)
}
/**
 * 入库
 * @param params 参数
 */
export function worksheetFXInWarehouse(params: any) {
  return axios.post(`${BASE_URL}workstation/op/worksheetFXInWarehouse`, params)
}
/**
 * 获取库位
 * @param params 参数
 */
export function getWarehouseCodeList(params: any) {
  return axios.get(`${BASE_URL}workstation/op/getWarehouseCodeList?${qs.stringify(params)}`)
}
/**
 * 获取库位
 * @param params 参数
 */
export function getPackageInWarehouseList(params: any) {
  return axios.get(`${BASE_URL}workstation/op/getPackageInWarehouseList?${qs.stringify(params)}`)
}
// endregion

// region 投料

/**
 * 投料-制浆
 * @param params 参数
 */
export function smkFeedSave(params: any) {
  return axios.post(`${BASE_URL}human/feed/smkFeedSave`, params)
}
/**
 * 投料-制粉
 * @param params 参数
 */
export function smkFeedZFSave(params: any) {
  return axios.post(`${BASE_URL}human/feed/smkFeedZFSave`, params)
}
/**
 * 投料-制色
 * @param params 参数
 */
export function smkFeedZSSave(params: any) {
  return axios.post(`${BASE_URL}human/feed/smkFeedZSSave`, params)
}
/**
 * 投料-制釉
 * @param params 参数
 */
export function smkFeedZYSave(params: any) {
  return axios.post(`${BASE_URL}human/feed/smkFeedZYSave`, params)
}
/**
 * 投料-复选
 * @param params 参数
 */
export function smkFeedFXSave(params: any) {
  return axios.post(`${BASE_URL}human/feed/smkFeedFXSave`, params)
}
/**
 * 投料-施釉
 * @param params 参数
 */
export function smkFeedSYSave(params: any) {
  return axios.post(`${BASE_URL}human/feed/smkFeedSYSave`, params)
}
/**
 * 投料-打包
 * @param params 参数
 */
export function smkFeedDBSave(params: any) {
  return axios.post(`${BASE_URL}human/feed/smkFeedDBSave`, params)
}
/**
 * 杂收
 * @param params 参数
 */
export function smkFeedZs(params: any) {
  return axios.post(`${BASE_URL}human/feed/smkFeedZs`, params)
}
/**
 * 投料校验
 * @param params 参数
 */
export function smkFeedCheck(params: any) {
  return axios.post(`${BASE_URL}human/feed/smkFeedCheck`, params)
}
/**
 * 投料校验
 * @param materialCode 参数
 */
export function getMaterialCodeList(materialCode: any) {
  return axios.get(`${BASE_URL}base/materialInfo/getByMaterialCodeAndName?materialCode=${materialCode}&pageNum=1&pageSize=100`)
}

// endregion

// region 流转

/**
 * 流转
 * @param params 参数
 */
export function turnRecordReport(params: any) {
  return axios.post(`${BASE_URL}workstation/op/turnRecordReport`, params)
}

// endregion

// region 能耗采集

/**
 * 获取能耗采集任务列表
 * @param params 参数
 */
export function getEnergyToDoList(params: any) {
  return axios.get(`${BASE_URL}workstation/op/getEnergyToDoList?${qs.stringify(params)}`)
}
/**
 * 能耗采集上传
 * @param params 参数
 */
export function energyCatch(params: any) {
  return axios.post(`${BASE_URL}workstation/op/energyCatch`, params)
}

// endregion


/**
 * 来源设备获取接口
 */
export function getLastEquipCodeList(worksheetCode: any, bindingId: any) {
  return axios.get(`${BASE_URL}workstation/op/getLastEquipCodeList?worksheetCode=${worksheetCode}&bindingId=${bindingId}`)
}
/**
 * 目标设备获取接口
 */
export function getEquipCodeListByType(worksheetCode: any, bindingId: any, type: number) {
  return axios.get(`${BASE_URL}workstation/op/getEquipCodeListByType?worksheetCode=${worksheetCode}&bindingId=${bindingId}&type=${type}`)
}
