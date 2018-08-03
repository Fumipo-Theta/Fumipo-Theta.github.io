(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.menuSymbol = factory();
  }
}(this, function () {
  const template = uiState => `
  <form class="symbolForm" name="symbolForm" style="width: 90%;min-height: 500px;">
    <a href="#" class="close_button" id="close_symbolForm"></a>
    <hr style="visibility:hidden">
    Fade out opacity
    <input class="mdl-slider mdl-js-slider" type="range" id="outOpacity" min="0" max="1" value="0.3" step="0.1" >
    
    Base circle opacity
    <input class="mdl-slider mdl-js-slider" type="range" id="baseOpacity" min="0" max="1" value="0.8" step="0.1" >
    
    Focused circle opacity
    <input class="mdl-slider mdl-js-slider" type="range" id="onOpacity" min="0" max="1" value="1" step="0.1">
    <hr>
    Fade out circle Radius
    <input class="mdl-slider mdl-js-slider" type="range" id="outRadius" min="1" max="12" value="3" step="0.5">
    
    Base circle Radius
    <input class="mdl-slider mdl-js-slider" type="range" id="baseRadius" min="1" max="12" value="6" step="0.5">
    
    Focused circle Radius
    <input class="mdl-slider mdl-js-slider" type="range" id="onRadius" min="1" max="12" value="9" step="0.5">
    
    <hr>
    Fade out line width
    <input class="mdl-slider mdl-js-slider" type="range" id="outWidth" min="0" max="3" value="0.25" step="0.05">
    
    Base line width
    <input class="mdl-slider mdl-js-slider" type="range" id="baseWidth" min="0" max="3" value="1" step="0.05">
    
    Focused line width
    <input class="mdl-slider mdl-js-slider" type="range" id="onWidth" min="0" max="3" value="3" step="0.05">
  `;

  const eventSetter = (emitter, uiState) => {

  }

  const option = {
    label: "Symbol",
    draggable: false
  }

  const style = `
  left: 15%;
  width: 25vw;
  min-width:300px;
  min-height: 100px;
  `

  return {
    template,
    option,
    eventSetter,
    style
  };
}))