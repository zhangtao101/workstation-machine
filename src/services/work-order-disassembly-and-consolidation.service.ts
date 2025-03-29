import axios from 'axios'
import qs from 'qs'
import { BASE_URL } from '@/services/config'

/**
 * 工单获取列表
 * @param params 参数
 */
export function searchProduceWorkSheetList(params: any) {
  return axios.get(`${BASE_URL}plan/worksheet/searchProduceWorkSheetList?${qs.stringify(params)}`)
}

/**
 * 查询所有线别
 * @param params 参数
 */
export function getAllLine(params: any) {
  return axios.get(`${BASE_URL}produce/Line/list/all?${qs.stringify(params)}`)
}

/**
 * 工单拆单
 * @param params 参数
 */
export function splitWorkSheet(params: any) {
  return axios.post(`${BASE_URL}plan/worksheet/splitWorkSheet`, params)
}

/**
 * 工单合单
 * @param params 参数
 */
export function mergeWorkSheet(params: any) {
  return axios.post(`${BASE_URL}plan/worksheet/mergeWorkSheet`, params)
}

/**
 * 获取产线维度产能核算信息
 * @param params 参数
 */
export function getLineProductCheck(params: any) {
  return axios.get(`${BASE_URL}plan/worksheet/getLineProductCheck?${qs.stringify(params)}`)
}

/**
 * 派工校验
 * @param params 参数
 */
export function sendProduceCheck(params: any) {
  return axios.get(`${BASE_URL}plan/worksheet/sendProduceCheck?${qs.stringify(params)}`)
}

/**
 * 派工
 * @param params 参数
 */
export function sendProduct(params: any) {
  return axios.post(`${BASE_URL}plan/worksheet/sendProduct`, params)
}
/**
 * 获取入库工单查询
 * @param params 参数
 */
export function getWorksheetWarehouseList(params: any) {
  return axios.get(`${BASE_URL}workstation/op/getWorksheetWarehouseList?${qs.stringify(params)}`)
}
/**
 * 工单入库补录接口
 * @param params 参数
 */
export function finishWorksheetInOut(params: any) {
  return axios.post(`${BASE_URL}workstation/op/finishWorksheetInOut`, params)
}
