<!--
 * @Author: mjh
 * @Date: 2022-09-01 16:27:12
 * @LastEditors: mjh
 * @LastEditTime: 2022-10-27 10:38:07
 * @Description:
-->
<template>
    <div class="container">
        <div class="table-header" :style="headerLineStyle">
            <div v-for="(item) in option" :key="item.key" class="table-header-item" :style="{ flex: item.flex, ...item.headerStyle, ...headerCellStyle }">
                <div v-if="item.type === 'select'" style="width: fit-content;margin: 0 auto;">
                    <select-panel :option="item.list" :default-select="item.defaultSelect" :label-style="{ fontSize: '12px', color: '#60A2E1' }" arrow="line" @change="item.click" />
                </div><span v-else>{{ item.label }}</span>
            </div>
        </div><el-scrollbar class="table-body" :style="{ height: pxToRem(height) }">
            <div v-for="(item, index) in data" :key="index" class="table-body-line" :class="[Number(index) === currIndex && canClick ? 'is-check-line' : '']" :style="lineStyle" @click="checkLine(item, Number(index))">
                <template v-for="optionItem in option" :key="optionItem.key">
                    <div class="table-body-item" :style="{ flex: optionItem.flex, ...optionItem.rowStyle, ...(optionItem.renderStyle ? optionItem.renderStyle(item, optionItem) : {}), ...lineCellStyle }">
                        <div v-if="optionItem.type === 'tool'" class="tool-box" :style="{ justifyContent: optionItem.toolList && optionItem.toolList.length === 1 ? 'center' : '' }">
                            <div v-for="(toolItem, ind) in optionItem.toolList" :key="ind" class="tool-item" @click="toolItem.click && toolItem.click(item, optionItem)">
                                {{ toolItem.label }}
                            </div>
                        </div>
                        <template v-else>
                            <slot :name="optionItem.key" :option-item="optionItem" :row="item">
                                <span>{{ getData(optionItem, item) }}</span>
                            </slot>
                        </template>
                    </div>
                </template>
            </div>
        </el-scrollbar>
    </div>
</template>

<script lang="ts" setup name="BadVRiverPopup">
import type { PropType } from 'vue'
import type { popTableOptionTs } from '@/types/common'
import { pxToRem } from '@/utils/tools'

defineProps({
    /**
     * ???????????????????????????
     */
    option: {
        type: Array as PropType<popTableOptionTs[]>,
        default: () => {
            return []
        }
    },
    /**
     * ????????????
     */
    data: {
        type: Array as PropType<record>,
        default: () => {
            return []
        }
    },
    /**
     * ????????????
     */
    height: {
        type: Number,
        default: undefined
    },
    /**
     * ?????????????????? ??????????????????
     */
    canClick: {
        type: Boolean,
        default: false
    },
    lineStyle: {
        type: Object,
        default: undefined
    },
    headerLineStyle: {
        type: Object,
        default: undefined
    },
    headerCellStyle: {
        type: Object,
        default: () => {}
    },
    lineCellStyle: {
        type: Object,
        default: () => {}
    },
})
const emit = defineEmits(['checkLine'])

const currIndex = ref(-1)
/**
 * @name: table ?????????????????????
 * @param {*} optionItem table?????????
 * @param {*} item ???????????????
 * @return {*} ????????????
 */
const getData = (optionItem: popTableOptionTs, item: record) => {
    if (optionItem.render) return optionItem.render(item, optionItem)
    return optionItem.key ? item[optionItem.key] : '/'
}
/**
 * @name: ?????????????????????
 * @desc:
 * @param {*} item ???????????????
 */
const checkLine = (item: record, index: number) => {
    if (currIndex.value === index) {
        currIndex.value = -1
        emit('checkLine', item, -1)
        return
    }
    currIndex.value = index
    emit('checkLine', item, index)
}

/**
 * @name: ??????????????????
 */
const clearClick = () => {
    currIndex.value = -1
}

defineExpose({
    clearClick
})
</script>

<style scoped lang="scss">
.container {
    width: 100%;

    .table-header {
        display: flex;
        align-items: center;
        align-self: stretch;
        width: 100%;
        height: 32px;
        padding: 6px 8px;
        /* stylelint-disable-next-line color-function-notation */
        background: rgb(96 162 225 / 0.1);

        .table-header-item {
            flex: 1;
            font-family: TRENDS;
            font-size: 12px;
            font-weight: normal;
            line-height: 12px;
            color: #60a2e1;
            text-align: center;
        }
    }

    .table-body {
        max-height: 710px;
        overflow-y: auto;

        .table-body-line {
            display: flex;
            align-items: center;
            padding: 13px 8px;
            cursor: pointer;

            .table-body-item {
                flex: 1;
                font-family: TRENDS;
                font-size: 14px;
                font-weight: normal;
                line-height: 14px;
                color: #fff;
                text-align: center;
            }
        }

        .is-check-line {
            background-color: #008dce;
            border: 1px solid #00e5ff;
            border-radius: 4px;
        }
    }

    .tool-box {
        display: flex;
        justify-content: space-between;
        width: 100%;

        .tool-item {
            font-family: TRENDS;
            font-size: 12px;
            font-weight: normal;
            line-height: 12px;
            color: #0df;
            letter-spacing: 0;
            cursor: pointer;
        }
    }
}
</style>
