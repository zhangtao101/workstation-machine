import axios from 'axios'
import qs from 'qs'
import { BASE_URL } from '@/services/config'

/**
 * 生产日历查询
 * @param params 参数
 */
export function getWorkCalendar(params: any) {
  return axios.get(`${BASE_URL}plan/worksheet/getWorkCalendar?${qs.stringify(params)}`)
}
