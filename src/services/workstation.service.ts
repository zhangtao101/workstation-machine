import axios from 'axios'
import { BASE_URL } from '@/services/config'
import qs from 'qs'

/**
 * 查询工作站
 */
export function queryWorkstation(params: any) {
  return axios.get(`${BASE_URL}workstation/setRecord/list?${qs.stringify(params)}`)
}
/**
 * 查询工作站
 */
export function getAllWorkstationList() {
  return axios.get(`${BASE_URL}workstation/setRecord/getAllWorkstationList`)
}
/**
 * 查询工作站详情
 */
export function proceSetDetailById(id: any) {
  return axios.get(`${BASE_URL}workstation/proceSetDetail/listById?id=${id}`)
}
/**
 * 根据工作站查询工单
 */
export function getWorksheetListByWorkstationCode(params: any) {
  return axios.get(`${BASE_URL}plan/worksheet/getWorksheetListByWorkstationCode?workstationCode=${params}`)
}
/**
 * 获取工单详情
 */
export function getWorksheetByCode(worksheetCode: any) {
  return axios.get(`${BASE_URL}plan/worksheet/getWorksheetByCode/${worksheetCode}`)
}
/**
 * 工单进站
 */
export function inputSmkWorksheet(params: any) {
  return axios.post(`${BASE_URL}human/patch/inputSmkWorksheet`, params)
}
/**
 * 工单出站
 */
export function outPutSmkWorksheet(params: any) {
  return axios.post(`${BASE_URL}human/patch/outPutSmkWorksheet`, params)
}
/**
 * 查询工作站详情
 */
export function queryWorkstationByCode(workstationCode: any) {
  return axios.get(`${BASE_URL}workstation/setRecord/queryByCode?workstationCode=${workstationCode}`)
}
/**
 * 查询工艺路线
 */
export function getRouteList(params: any) {
  return axios.get(`${BASE_URL}process/route/getRouteList?${qs.stringify(params)}`)
}
