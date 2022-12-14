/*
 * @Author: mjh
 * @Date: 2022-09-13 17:29:30
 * @LastEditors: mjh
 * @LastEditTime: 2022-11-09 19:49:16
 * @Description:
 */
export interface alarmListTs {
    code: 'success'
    count: number
    data: null | alarmListDataTs[]
    message: string
    totalCount: number
}

export interface alarmListDataTs {
    factorName: string
    factorValue: string
    factorUnit: string
    factorCode: string
    dataTimeStr: string
    detailList: {
        factorName: string
        factorValue: string
        factorUnit: string
        factorCode: string
    }[]
}

export interface alarmLevelAllTs {
    alarmLevelCode: string
    alarmLevelColor: string
    alarmLevelName: string
}

export interface alarmFactorTs {
    code: string
    name: string
}

export interface AlgaeWarningList {
    code: string
    data: null | Record<string, any>
    message: string
    success?: boolean
}
export interface alarmFlowApiTs {
    alarmInfo: record
    alarmInfos: null
    missionInfo: record
    superviseInfo: record[]
    taskInfo: record[]
}
