<template>
  <div class="card graph-card p-3">
    <h6>{{ title }}</h6>
    <apexchart :type="type" height="200" :options="chartOptions" :series="series"></apexchart>
  </div>
</template>

<script>
import VueApexCharts from "vue3-apexcharts"

export default {
  name: "ApexGraph",
  components: { apexchart: VueApexCharts },
  props: { title: String, type: String, data: Array, categories: Array },
  data() {
    return {
      series: [{ name: this.title, data: this.data }],
      chartOptions: {
        chart: { background: "transparent", foreColor: "#121212" }, // black text
        xaxis: { categories: this.categories },
        colors: ["#121212"] // black bars/lines
      }
    }
  }
}
</script>

<style scoped>
.graph-card {
  background-color: #ffffff; /* white card */
  color: #121212;            /* black text */
  border: 1px solid #ddd;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
</style>
