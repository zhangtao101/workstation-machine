import axios from 'axios'
import { BASE_URL } from '@/services/config'
import * as qs from 'qs'

/**
 * 获取机台汇总详情
 */
export function getHomepage(workstationCode: string, worksheetCode: string = '') {
  return axios.get(`${BASE_URL}interaction/work/getHomepage?workstationCode=${workstationCode}&worksheetCode=${worksheetCode}`)
}

/**
 * 获取质量汇总详情
 */
export function getQualityHomepage() {
  return axios.get(`${BASE_URL}interaction/work/getQualityHomepage`)
}

/**
 * 取抛光的报工的产品编号
 */
export function getProductByWorksheetAndBindingId(params: any) {
  return axios.get(`${BASE_URL}workstation/op/getProductByWorksheetAndBindingId?${qs.stringify(params)}`)
}

/**
 * 获取人时机时
 */
export function getWorksheetCurrentTime(params: any) {
  return axios.get(`${BASE_URL}workstation/op/getWorksheetCurrentTime?${qs.stringify(params)}`)
}

/**
 * 登录
 */
export function humanLogin(userNumber: string, workstationCode?: string) {
  return axios.post(`${BASE_URL}human/login`, { opUser: userNumber, workstationCode: workstationCode })
}
/**
 * 获取当前登录用户信息
 */
export function getCurrentUser() {
  return axios.get(`${BASE_URL}human/getCurrentUser`)
}

/**
 * 退出登录
 */
export function humanLogout(userNumber: string, workstationCode: string) {
  return axios.post(`${BASE_URL}human/logout`, { opUser: userNumber, workstationCode: workstationCode })
}
