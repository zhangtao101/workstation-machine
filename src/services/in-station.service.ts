import axios from 'axios'
import qs from 'qs'
import { BASE_URL, BASE_USER_URL } from '@/services/config'

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
 * @param worksheetCode 参数
 */
export function getBomMaterialListByCode(equipCode: any, worksheetCode: string = '') {
  return axios.get(`${BASE_URL}human/patch/getBomMaterialListByCode?equipCode=${equipCode}&worksheetCode=${worksheetCode}`)
}

/**
 * 查询BOM列表(制粉专用)
 * @param equipCode 参数
 * @param worksheetCode 参数
 */
export function getZFBomMaterialListByCode(equipCode: any, worksheetCode: string = '') {
  return axios.get(`${BASE_URL}human/patch/getZFBomMaterialListByCode?equipCode=${equipCode}&worksheetCode=${worksheetCode}`)
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
 * 数据字典表请求
 */
export function listWordListByParentCode() {
  return axios.get(`${BASE_USER_URL}sys/word/listWordListByParentCode/LYZPLX`)
}

/**
 * 领料
 * @param params 参数
 */
export function getMaterials(params: any) {
  return axios.post(`${BASE_URL}workstation/op/materialPGApply`, params)
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
 * 入库
 * @param params 参数
 */
export function worksheetBCP1InWarehouse(params: any) {
  return axios.post(`${BASE_URL}workstation/op/worksheetBCP1InWarehouse`, params)
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
 * 加料内容获取(粉料新增)
 * @param materialCode 参数
 */
export function getWarehouseByMaterialCode(materialCode: any) {
  return axios.get(`${BASE_URL}workstation/op/getWarehouseByMaterialCode?materialCode=${materialCode}`)
}
/**
 * 物料获取
 */
export function getMaterialCodeByJjcl() {
  return axios.get(`${BASE_URL}workstation/op/getMaterialCodeByJjcl`)
}
/**
 * 33、推送超领审批
 * @param params 参数
 */
export function pushAuditRecord(params: any) {
  return axios.post(`${BASE_URL}human/feed/pushAuditRecord`, params)
}
/**
 * 获取当前单号的最新信息
 * @param params 参数
 */
export function getAuditByRecord(params: any) {
  return axios.get(`${BASE_URL}human/feed/getAuditByRecord?${qs.stringify(params)}` )
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
/**
 * 压机设置上报
 * @param params 参数
 */
export function lcMaterialSetReport(params: any) {
  return axios.post(`${BASE_URL}workstation/op/lcMaterialSetReport`, params)
}
/**
 * 获取料号
 * @param params 参数
 */
export function getCxMaterialListByWorksheetCode(params: any) {
  return axios.get(`${BASE_URL}workstation/op/getCxMaterialListByWorksheetCode?${qs.stringify(params)}`)
}
/**
 * 获取上报历史记录
 * @param params 参数
 */
export function getLcHistory(params: any) {
  return axios.get(`${BASE_URL}workstation/op/getLcHistory?${qs.stringify(params)}`)
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
 * 来源设备获取接口
 */
export function getLyEquipCodeList(params: any) {
  return axios.get(`${BASE_URL}workstation/op/getLyEquipCodeList?${qs.stringify(params)}`)
}
/**
 * 目标设备获取接口
 */
export function getEquipCodeListByType(worksheetCode: any, bindingId: any, type: number) {
  return axios.get(`${BASE_URL}workstation/op/getEquipCodeListByType?worksheetCode=${worksheetCode}&bindingId=${bindingId}&type=${type}`)
}
/**
 * 获取流转操作的最新记录
 */
export function getTurnRecordByParam(worksheetCode: any, bindingId: any) {
  return axios.get(`${BASE_URL}workstation/op/getTurnRecordByParam?worksheetCode=${worksheetCode}&bindingId=${bindingId}`)
}
/**
 * 获取流转操作的最新记录
 */
export function getProcessRecordByParam(worksheetCode: any, bindingId: any) {
  return axios.get(`${BASE_URL}workstation/op/getProcessRecordByParam?worksheetCode=${worksheetCode}&bindingId=${bindingId}`)
}
/**
 * 获取釉料移动设备
 */
export function getYlzyWarehouseCodeList(workstationCode: any) {
  return axios.get(`${BASE_URL}workstation/op/getYlzyWarehouseCodeList?workstationCode=${workstationCode}&areaCode=`)
}
/**
 * 釉料移动
 */
export function turnMaterialRecordReport(params: any) {
  return axios.post(`${BASE_URL}workstation/op/turnMaterialRecordReport`, params)
}
/**
 * 获取物料库存信息
 */
export function getWarehouseListByStationCode(workstationCode: string) {
  return axios.get(`${BASE_URL}workstation/op/getWarehouseListByStationCode?workstationCode=${workstationCode}`)
}
/**
 * 获取物料库存信息
 */
export function getMaterialCodeByWarehouseCode(warehouseCode: string) {
  return axios.get(`${BASE_URL}workstation/op/getMaterialCodeByWarehouseCode?warehouseCode=${warehouseCode}`)
}

/**
 * 获取物料库存信息(粉料)
 */
export function getAllLCWarehouseList(areaCode: string) {
  // https://v507z46671.yicp.fun/mes-main/workstation/op/getAllLCWarehouseList
  return axios.get(`${BASE_URL}workstation/op/getAllLCWarehouseList?areaCode=${areaCode}`)
}

/**
 * 获取物料库存信息(色料)
 */
export function getAllSjWarehouseList(params: any) {
  // https://v507z46671.yicp.fun/mes-main/workstation/op/getAllSjWarehouseList
  return axios.get(`${BASE_URL}workstation/op/getAllSjWarehouseList?${qs.stringify(params)}`)
}
/**
 * 绑定工艺路线
 */
export function bindingRoute(params: any) {
  return axios.post(`${BASE_URL}workstation/op/bindingRoute`, params)
}
