import axios from 'axios'
import qs from 'qs'
import { BASE_URL, BASE_USER_URL } from '@/services/config'

/**
 * 获取工艺配置参数模板
 * @param params
 */
export function getProductStandardList(params: any) {
  return axios.get(`${BASE_URL}workstation/op/getProductStandardList?${qs.stringify(params)}`)
}
/**
 * 获取异常类型
 * @param parentCode
 */
export function listWordListByParentCode(parentCode: any) {
  return axios.get(`${BASE_USER_URL}sys/word/listWordListByParentCode/${parentCode}`)
}
/**
 * 获取工艺配置参数模板
 * @param params
 */
export function getParamToDoList(params: any) {
  return axios.get(`${BASE_URL}workstation/op/getParamToDoList?${qs.stringify(params)}`)
}
/**
 * 仪表查询
 * @param params
 */
export function getEnergyEquipCodeList(params: any) {
  return axios.get(`${BASE_URL}workstation/op/getEnergyEquipCodeList?${qs.stringify(params)}`)
}
/**
 * 获取报工单列表
 * @param params
 */
export function getReportToDoList(params: any) {
  return axios.get(`${BASE_URL}workstation/op/getReportToDoList?${qs.stringify(params)}`)
}
/**
 * 工艺参数上传
 * @param params
 */
export function proceParamCatch(params: any) {
  return axios.post(`${BASE_URL}workstation/op/proceParamCatch`, params)
}
/**
 * 报工
 * @param params
 */
export function worksheetReport(params: any) {
  return axios.post(`${BASE_URL}workstation/op/worksheetReport`, params)
}
/**
 * 采集上传
 * @param params
 */
export function energyCatch(params: any) {
  return axios.post(`${BASE_URL}workstation/op/energyCatch`, params)
}
/**
 * 获取采集上传日志
 * @param params
 */
export function getEnergyHisory(params: any) {
  return axios.get(`${BASE_URL}workstation/op/getEnergyHisory?${qs.stringify(params)}`)
}
/**
 * 获取报工日志
 * @param params
 */
export function getReportHistory(params: any) {
  return axios.get(`${BASE_URL}workstation/op/getReportHistory?${qs.stringify(params)}`)
}
/**
 * 出站
 * @param params
 */
export function outPutSmkWorksheet(params: any) {
  return axios.post(`${BASE_URL}human/patch/outPutSmkWorksheet`, params)
}
/**
 * 非生产上报（人时）
 * @param params
 */
export function unProduceReport(params: any) {
  return axios.post(`${BASE_URL}workstation/op/unProduceReport`, params)
}
