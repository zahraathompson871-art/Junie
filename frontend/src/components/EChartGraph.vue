<template>
  <div class="card bg-dark text-light p-3">
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
      textStyle: { color: "#fff" },
      xAxis: { type: "category", data: this.categories },
      yAxis: { type: "value" },
      series: [{
        data: this.data,
        type: "line",
        smooth: true,
        color: "#1f102c"
      }]
    })
  }
}
</script>
