import axios from 'axios'
import { BASE_URL } from '@/services/config'
import * as qs from 'qs'

/**
 * 获取机台汇总详情
 */
export function getHomepage(workstationCode: string) {
  return axios.get(`${BASE_URL}interaction/work/getHomepage?workstationCode=${workstationCode}`)
}

/**
 * 获取质量汇总详情
 */
export function getQualityHomepage() {
  return axios.get(`${BASE_URL}interaction/work/getQualityHomepage`)
}/**
 * 取抛光的报工的产品编号
 */
export function getProductByWorksheetAndBindingId(params: any) {
  return axios.get(`${BASE_URL}/workstation/op/getProductByWorksheetAndBindingId?${qs.stringify(params)}`)
}

/**
 * 登录
 */
export function humanLogin(userNumber: string, workstationCode: string) {
  return axios.post(`${BASE_URL}human/login`, { opUser: userNumber, workstationCode: workstationCode })
}

/**
 * 退出登录
 */
export function humanLogout(userNumber: string, workstationCode: string) {
  return axios.post(`${BASE_URL}human/logout`, { opUser: userNumber, workstationCode: workstationCode })
}
