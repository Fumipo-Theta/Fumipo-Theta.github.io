import TopMenu from "./top-menu";
import * as menuFileLoad from "./menu-file-load";
import * as menuTooltip from "./menu-tooltip"
import * as menuSymbol from "./menu-symbol";
import * as menuLegend from "./menu-legend";
import GraphAppender from "./graph-appender";
import GraphBinaryPlot from "./Graph-binary-plot";
import GraphAbundancePlot from "./Graph-abundance-plot";
import * as graphSettingBtn from "./graph-btn-setting";
import * as graphDeleteBtn from "./graph-btn-delete";
import * as graphPngBtn from "./graph-btn-save_as_png";
import * as graphRefreshBtn from "./graph-btn-refresh";
import UIUpdater from "./ui-updater";
import Overlay from "./overlay"
import Tooltip from "./tooltip"
import ConcatStringAST from "ast/src/arithmetic/concat_string/ast"
class StringAST extends ConcatStringAST {
    constructor(...arg) {
        super(...arg)
    }

    evaluate(...arg) {
        try {
            return super.evaluate(...arg)
        } catch (e) {
            if (e instanceof TypeError) return ""
        }
    }
}



const initializer = {

    'legend': {
        'userStyleURL': './data/legend_region.json',
        'commonStyleURL': './css/graph_common.css'
    },
    'userDataSetting': {
        'useDefault': true,
        'url': './data/lava_compositions.csv'
    },
    'referranceDataSetting': {
        'useDefault': true,
        'url': './data/Refferencial_abundance.csv'
    }
}

const autoMode = {
    'menu': {
        'symbol': [
            {
                'id': 'outOpacity',
                'min': 0,
                'max': 1,
                'step': 0.1,
                'value': 0.1
            },
            {
                'id': 'baseOpacity',
                'min': 0,
                'max': 1,
                'step': 0.1,
                'value': 0.8
            },
            {
                'id': 'onOpacity',
                'min': 0,
                'max': 1,
                'step': 0.1,
                'value': 1
            },
            {
                'id': 'outRadius',
                'min': 1,
                'max': 12,
                'step': 0.5,
                'value': 6
            },
            {
                'id': 'baseRadius',
                'min': 1,
                'max': 12,
                'step': 0.5,
                'value': 6
            },
            {
                'id': 'onRadius',
                'min': 1,
                'max': 12,
                'step': 0.5,
                'value': 9
            },
            {
                'id': 'outWidth',
                'min': 0,
                'max': 3,
                'step': 0.05,
                'value': 0.25
            },
            {
                'id': 'baseWidth',
                'min': 0,
                'max': 3,
                'step': 0.05,
                'value': 1
            },
            {
                'id': 'onWidth',
                'min': 0,
                'max': 3,
                'step': 0.05,
                'value': 3
            }
        ]
    },
    'plot': [
        {
            'type': 'binary',
            'inputList': [
                { 'id': 'xName', 'type': 'value', 'value': 'SiO2' },
                { 'id': 'yName', 'type': 'value', 'value': 'MgO' },
                { 'id': 'x_min', 'type': 'value', 'value': null },
                { 'id': 'x_max', 'type': 'value', 'value': null },
                { 'id': 'y_min', 'type': 'value', 'value': null },
                { 'id': 'y_max', 'type': 'value', 'value': null },
                { 'id': 'checkLogX', 'type': 'checked', 'value': false },
                { 'id': 'checkLogY', 'type': 'checked', 'value': false },
                { 'id': 'imageSize', 'type': 'value', 'value': 0.3 },
                { 'id': 'aspect', 'type': 'value', 'value': 0.8 }
            ]
        },
        {
            'type': 'abundance',
            'inputList': [
                { 'id': 'eleName', 'type': 'value', 'value': 'La Ce Pr Nd Sm Eu Gd Tb Dy Ho Er Tm Yb Lu' },
                { 'id': 'reserver', 'type': 'value', 'value': 'PM,Sun&McDonough-1989' },
                { 'id': 'y_min', 'type': 'value', 'value': 0.01 },
                { 'id': 'y_max', 'type': 'value', 'value': 1000 },
                { 'id': 'imageSize', 'type': 'value', 'value': 0.7 },
                { 'id': 'aspect', 'type': 'value', 'value': 0.8 }
            ]

        }
    ]

}

/**
 * {id} {name} ->{id}+ +{name}
 * @param {string} expression
 */
const tooltipPreprocessor = (expression) => {
    return expression.replace(/\}\s{0,}\{/g, "}+ +{")
}

const state = {
    data: [
        { x: 1, y: 2, dummy: 1, study: "mine" },
        { x: 0, y: -1, dummy: 1 },
        { x: 2, y: 10, dummy: 1 },
        { y: 0, z: 11, dummy: 1 },
        { y: 1, z: 3, dummy: 1 }
    ],
    symbol: {
        baseOpacity: 0.7,
        baseRadius: 4,
        baseWidth: 1,
        onOpacity: 0.9,
        onRadius: 5,
        onWidth: 3,
        selectedOpacity: 1,
        selectedRadius: 6,
        selectedWidth: 5,
        outOpacity: 0.3,
        outRadius: 2,
        outWidth: 0.25,
    },
    styleClass: "",
    optionalClasses: ["study"],
    dataStack: [],
    tooltipAST: new StringAST(tooltipPreprocessor)
}

const emitter = new UIUpdater()
const settingOverlay = new Overlay("#setting_overlay")
const topMenu = new TopMenu("fixed-menu-contents", settingOverlay, emitter, state)
const tooltip = new Tooltip("#graph_area")
const ga = new GraphAppender("graph_area", "setting_menu", settingOverlay, tooltip, emitter, state);



/*
  ここで明示的にemitterにactionを登録スべきか,
  menuアイテムなどを読み込むときに自動的にactionがセットされるようにしたほうがいいか.
*/

window.onresize = () => {
    emitter.replot();
    emitter.afterReplot();
}

window.onload = () => {

    let url = './css/graph_common.css'

    fetch(url).then(function (data) {
        return data.text();
    }).then(function (text) {
        document.querySelector("#graph_style").innerHTML = (text);
    });

    $('#graph_area').sortable({
        cursor: "move",
        opacity: 0.7,
        handle: "h1"
    });

    topMenu.register(
        menuFileLoad,
        menuTooltip,
        menuSymbol,
        menuLegend,
    );

    ga.registerBtns(
        graphSettingBtn,
        graphRefreshBtn,
        graphPngBtn,
        graphDeleteBtn
    )
        .registerGraphManager(
            GraphBinaryPlot,
            GraphAbundancePlot
        );

}

/*
window.onbeforeunload = function (e) {
  return "Unload ?";
};
*/
