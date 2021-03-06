import publisher from "./pub-sub"
import { isActive, activate, deactivate } from "./usecases/toggle_active_state"

export default class GraphAppender {
    constructor(graphAreaId, graphMenuContentsId, overlay, tooltip, eventEmitter, uiState) {
        this.exportToEventEmitter(eventEmitter);
        this.emitter = eventEmitter;
        this.tooltip = tooltip;
        this.uiState = uiState;
        this.graphMenuBtns = [];
        this.graphAreaId = graphAreaId;
        this.graphMenuContentsId = graphMenuContentsId;
        this.graphManager = {};
        this.initialize();

        overlay.addClickEventListener(() => {
            publisher.publish({ type: "hide-all-graph-settings" })
        })
        return this;
    }

    exportToEventEmitter(emitter) {
        emitter.registerAction({ type: "replot", action: GraphAppender.replotAll(this) })
    }

    initialize() {
        this.setGraphAppendButtonArea();
        return this;
    }

    setGraphAppendButtonArea() {
        const div = document.createElement("div");
        div.id = "graphAppender";
        div.innerHTML = `
      <form class="graphAppender" id="graphAppend_button"></form>
      `
        document.querySelector("#" + this.graphAreaId).appendChild(div);
        this.dom = document.querySelector("#graphAppend_button");
    }





    registerBtns(...graphMenuBtns) {
        this.graphMenuBtns = graphMenuBtns;
        document.querySelector("body").appendChild(
            (_ => {
                const style = document.createElement("style")
                style.innerHTML = this.graphMenuBtns.map(({ style }) => style)
                    .reduce((a, b) => a + "\n" + b, "");
                style.id = "graph-menu-btn-style";
                return style;
            })()
        )
        return this;
    }


    /**
     * Graphタイプを追加すると,
     * 1. 追加ボタンを登録
     * 2. 各Graphクラスへのグラフの登録やstate更新をラップする
     */
    registerGraphManager(...GraphManager) {
        GraphManager.forEach(G => {
            const g = new G(this.uiState);
            this.setGraphAppendButton({
                label: g.buttonLabel(),
                type: g.graphType()
            });
            this.graphManager[g.graphType()] = g;
        })
        return this;
    }

    setGraphAppendButton({ label, type }) {
        const appendBtn = document.createElement("input");
        appendBtn.id = `append${type}`;
        appendBtn.classList.add("button", "graphAppender");
        appendBtn.type = "button";
        appendBtn.value = `+ ${label}`;
        appendBtn.addEventListener(
            "click",
            ev => this.appendGraph(type),
            false
        )
        this.dom.appendChild(appendBtn);
    }

    appendGraph(type) {
        const G = this.graphManager[type];
        const id = G.getCount();
        this.appendGraphSetting(G);
        this.appendGraphArea(G);
        G.append(
            this.getTypeId("graph", type, id),
            this.getTypeId("setting", type, id),
            this.tooltip,
            id
        )
        this.emitter.afterReplot();
        G.incrementCounter();
    }

    appendGraphSetting(G) {
        const emitter = this.emitter;
        const type = G.graphType();
        const id = G.getCount()
        const settingId = this.getTypeId("setting", type, id);

        const setting = document.createElement("div");
        setting.classList.add("graph-setting");
        setting.innerHTML = G.getTemplate(this.uiState);
        setting.id = settingId;
        setting.setAttribute("style", G.getStyle());
        setting.addEventListener(
            "change",
            ev => {
                G.update(id)
                emitter.afterReplot();
            },
            false
        )
        document.querySelector("#" + this.graphMenuContentsId)
            .appendChild(setting);

        GraphAppender.setOpenClose(
            setting,
        );

        activate(setting)
        publisher.publish({ type: "show-overlay" })
        setting.querySelector("input").focus();
    }

    /**
     * div#${graphAreaId}
     *  \-div#graph-${type}_${id}.graph
     *    \-div#nav-${type}_${id}
     *      \-ul
     *        \-li
     *          \-a#nav_save-${type}-${id}.nav_save
     *        \-li
     *          \-a#nav_setting-${type}-${id}.nav_setting
     *    \-div#plot-${type}_${id}.plot
     *      \-h1
     *      \-svg
     * @param {*} G
     */
    appendGraphArea(G) {
        const type = G.graphType();
        const id = G.getCount();
        const graphArea = d3.select("#" + this.graphAreaId);

        const graph = graphArea.insert("div", "#graphAppender")
            .attr("class", "graph")
            .attr("id", this.getTypeId("graph", type, id))

        const graphMenu = graph.append("div");
        graphMenu.attr("id", this.getTypeId("nav", type, id))
            .append("ul")
            .attr("style", this.menuBtnStyle);

        const graphBtns = graphMenu.select("ul")
            .selectAll("li")
            .data(this.graphMenuBtns)
            .enter()
            .append("li")
            .append("a")
            .attr("id", d => this.getTypeId(d.btnName, type, id))
            .attr("class", d => d.btnName)
            .on("click", d => d.click(
                "#" + this.getTypeId("graph", type, id),
                "#" + this.getTypeId("setting", type, id),
                "#" + this.overlayId,
                id,
                G
            ));

        const plot = graph.append("div")
            .attr("id", this.getTypeId("plot", type, id))
            .attr("class", "plot")

        $(`#${this.getTypeId("graph", type, id)}`).addClass("active");
    }

    getTypeId(prefix, type, id) {
        return `${prefix}-${type}_${id}`;
    }


    static replotAll(graphAppender) {
        return _ => {
            Object.values(graphAppender.graphManager).forEach(G => {
                G.replot();
            })
        }
    }

    /**
     *
     * @param {HTMLElement} btn
     * @param {HTMLElement} content
     */
    static setOpenClose(content) {
        publisher.subscriber().subscribe("hide-all-graph-settings", () => {
            deactivate(content)
            const activeGraph = document.querySelector(".graph.active")
            if (activeGraph) activeGraph.classList.remove("active")
        })

        content.querySelector(".close_button").addEventListener("click", () => {
            publisher.publish({ type: "hide-all-graph-settings" })
            publisher.publish({ type: "hide-overlay" })
        })

    }

};
