// Several ideas for React-D3 implementation derived from Curran Kelleher's
// https://vizhub.com/curran/73bcdb68be6b4500b03827c9d58defba
// Hover state handling between parent and child components adapted from Martin Blatz's
// https://vizhub.com/martinblatz/fa7ccb3fee8540e4933b8dd78604b077
// Credit for tooltip Date and GDP presentation and some of the CSS:
// @Christian-Paul https://codepen.io/freeCodeCamp/pen/GrZVaM

const { useState, useEffect, useCallback } = React;

const url =
"https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json";

const width = 960,
height = 500;
const margin = { top: 50, right: 20, bottom: 20, left: 100 };
const innerHeight = height - margin.top - margin.bottom;
const innerWidth = width - margin.right - margin.left;


// App Parent Component
const App = () => {
  const [data, setData] = useState(null);
  const [hoveredValue, setHoveredValue] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    d3.json(url).then((json, item) => {
      setData(json.data);
    });
  }, []);

  const handleMouseMove = useCallback(
  event => {
    const { clientX, clientY } = event;
    setMousePosition({ x: clientX, y: clientY });
  },
  [setMousePosition]);


  if (!data) {
    return /*#__PURE__*/React.createElement("pre", null, "Loading...");
  }

  const barWidth = innerWidth / data.length;

  const xAxisTickFormat = d3.timeFormat("%Y");
  const yAxisTickFormat = d3.format(",");

  const xValue = d => new Date(d[0]);
  const yValue = d => d[1];

  const dataDate = data.map(xValue);
  const dataGDP = data.map(yValue);

  const xScale = d3.
  scaleTime().
  domain(d3.extent(dataDate)).
  range([0, innerWidth]);

  const yScale = d3.
  scaleLinear().
  domain(d3.extent(dataGDP)).
  range([innerHeight, 0]).
  nice();

  return /*#__PURE__*/(
    React.createElement("div", null, /*#__PURE__*/
    React.createElement(Tooltip, { hoveredValue: hoveredValue, mousePosition: mousePosition }), /*#__PURE__*/
    React.createElement("div", { id: "viz-container" }, /*#__PURE__*/
    React.createElement("div", { id: "title" }, "United States GDP"), /*#__PURE__*/
    React.createElement("div", { id: "subtitle" }, "(1947 \u2014 2015)"), /*#__PURE__*/
    React.createElement("div", { id: "left-axis-label" }, "GDP in Billion USD"), /*#__PURE__*/
    React.createElement("svg", { id: "main-svg", width: width, height: height }, /*#__PURE__*/
    React.createElement("g", { transform: `translate(${margin.left}, ${margin.top})` }, /*#__PURE__*/
    React.createElement("g", { id: "y-axis" }, /*#__PURE__*/
    React.createElement(AxisLeft, {
      yScale: yScale,
      innerWidth: innerWidth,
      tickFormat: yAxisTickFormat,
      tickOffset: 5 })), /*#__PURE__*/


    React.createElement("g", { id: "x-axis" }, /*#__PURE__*/
    React.createElement(AxisBottom, {
      xScale: xScale,
      innerHeight: innerHeight,
      tickFormat: xAxisTickFormat,
      tickOffset: 5 })), /*#__PURE__*/


    React.createElement(Marks, {
      data: data,
      xValue: xValue,
      xScale: xScale,
      yScale: yScale,
      innerHeight: innerHeight,
      barWidth: barWidth,
      setHoveredValue: setHoveredValue,
      handleMouseMove: handleMouseMove }))))));






};

// Tooltip Component
const Tooltip = ({ hoveredValue, mousePosition }) => {
  const dateToQuarters = date => {
    switch (date.substring(5, 7)) {
      case "01":
        return date.substring(0, 4) + " Q1";
      case "04":
        return date.substring(0, 4) + " Q2";
      case "07":
        return date.substring(0, 4) + " Q3";
      case "10":
        return date.substring(0, 4) + " Q4";
      default:
        return date;}

  };

  if (!hoveredValue) {
    return /*#__PURE__*/React.createElement("div", { id: "tooltip-container", style: { visibility: "hidden" } });
  } else {
    const xPosition = mousePosition.x;
    const yPosition = mousePosition.y;

    return /*#__PURE__*/(
      React.createElement("div", {
        id: "tooltip-container",
        style: { left: `${xPosition - 75}px`, top: `${yPosition - 90}px` } }, /*#__PURE__*/

      React.createElement("div", {
        id: "tooltip",
        "data-date": hoveredValue[0],
        style: { textAlign: "center", padding: "5px", fontSize: "1.2rem" } },

      dateToQuarters(hoveredValue[0])), /*#__PURE__*/

      React.createElement("div", { style: { textAlign: "center", padding: "2px" } }, /*#__PURE__*/
      React.createElement("span", { style: { fontSize: "1.2rem" } }, "$",
      hoveredValue[1].toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, "$1,"), " "), /*#__PURE__*/

      React.createElement("span", { style: { fontSize: "0.9rem" } }, "Billion USD"))));



  }
};

// Marks (Bars) Component
const Marks = ({
  data,
  setHoveredValue,
  handleMouseMove,
  xValue,
  xScale,
  yScale,
  innerHeight,
  barWidth }) =>

data.map((d) => /*#__PURE__*/
React.createElement("rect", {
  key: d[0],
  className: "bar",
  fill: "steelblue",
  "data-date": d[0],
  "data-gdp": d[1],
  x: xScale(xValue(d)),
  y: yScale(d[1]),
  width: barWidth,
  height: innerHeight - yScale(d[1]),
  onMouseEnter: () => setHoveredValue([d[0], d[1]]),
  onMouseLeave: () => setHoveredValue(null),
  onMouseMove: handleMouseMove }));



// AxisLeft Component
const AxisLeft = ({ yScale, innerWidth, tickFormat, tickOffset }) =>
yScale.ticks().map((tickValue) => /*#__PURE__*/
React.createElement("g", {
  key: tickValue,
  className: "tick",
  transform: `translate(0,${yScale(tickValue)})` }, /*#__PURE__*/

React.createElement("line", { x2: innerWidth, stroke: "#f1f2f3" }), /*#__PURE__*/
React.createElement("text", { style: { textAnchor: "end" }, x: -tickOffset, dy: ".32em" },
tickFormat(tickValue))));




// AxisBottom Component
const AxisBottom = ({ xScale, innerHeight, tickFormat, tickOffset }) =>
xScale.ticks().map((tickValue) => /*#__PURE__*/
React.createElement("g", {
  key: tickValue,
  className: "tick",
  transform: `translate(${xScale(tickValue)},0)` }, /*#__PURE__*/

React.createElement("line", null), /*#__PURE__*/
React.createElement("text", {
  style: { textAnchor: "middle" },
  dy: ".71em",
  y: innerHeight + tickOffset },

tickFormat(tickValue))));




const rootElement = document.getElementById("root");
ReactDOM.render( /*#__PURE__*/React.createElement(App, null), rootElement);