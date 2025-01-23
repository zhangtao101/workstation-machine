import axios from 'axios'
import qs from 'qs'
import { BASE_URL } from '@/services/config'

/**
 * 根据库位获取批次
 * @param params 参数
 */
export function getBatchByAreaCode(params: any) {
  return axios.get(`${BASE_URL}workstation/op/getBatchByAreaCode?${qs.stringify(params)}`, )
}
/**
 * 获取中间库在库数据
 * @param params 参数
 */
export function listWarehouseRecord(params: any) {
  return axios.get(`${BASE_URL}workstation/op/listWarehouseRecord?${qs.stringify(params)}`, )
}
/**
 * 查询工单
 * @param params 参数
 */
export function searchWorksheet(params: any) {
  return axios.get(`${BASE_URL}/plan/worksheet/search?${qs.stringify(params)}`, )
}
/**
 * 出库
 * @param params 参数
 */
export function outWarehouseRecord(params: any) {
  return axios.post(`${BASE_URL}workstation/op/outWarehouseRecord`, params)
}
