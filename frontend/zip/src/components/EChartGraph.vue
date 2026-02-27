<template>
  <div class="card graph-card p-3">
    <h6>{{ title }}</h6>
    <div ref="chart" style="height:200px;"></div>
  </div>
</template>

<script>
import * as echarts from "echarts"

export default {
  name: "EChartGraph",
  props: { title: String, data: Array, categories: Array },
  mounted() {
    const chart = echarts.init(this.$refs.chart)
    chart.setOption({
      backgroundColor: "transparent",
      textStyle: { color: "#121212" }, // black text
      xAxis: { type: "category", data: this.categories, axisLine: { lineStyle: { color: "#121212" } } },
      yAxis: { type: "value", axisLine: { lineStyle: { color: "#121212" } } },
      series: [{
        data: this.data,
        type: "line",
        smooth: true,
        color: "#121212" // black line
      }]
    })
  }
}
</script>

<style scoped>
.graph-card {
  background-color: #ffffff; 
  color: #121212;            
  border: 1px solid #ddd;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
</style>

