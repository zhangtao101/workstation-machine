import axios from 'axios'
import { BASE_URL } from '@/services/config'
import qs from 'qs'

/**
 * 获取工单
 */
export function listWorksheetByIp() {
  return axios.get(`${BASE_URL}produce/interactionPoint/listWorksheetByIp`)
}

/**
 * 获取文件
 */
export function listFileNameByWorksheetCode(worksheetCode: string) {
  return axios.get(`${BASE_URL}process/productSop/listFileNameByWorksheetCode/${worksheetCode}`)
}

/**
 * 预览文件
 */
export function download(params: { id: number; fileName: string; }, headers: any) {
  return axios.get(`${BASE_URL}process/productSop/download?${qs.stringify(params)}`, headers)
}
