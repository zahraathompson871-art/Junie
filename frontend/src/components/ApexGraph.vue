<template>
  <div class="card bg-dark text-light p-3">
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
        chart: { background: "transparent", foreColor: "#fff" },
        xaxis: { categories: this.categories },
        colors: ["#1f102c"]
      }
    }
  }
}
</script>
