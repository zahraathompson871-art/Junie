<template>
  <div class="graph-card">
    <div class="card-header">
      <h6 class="card-title">{{ title }}</h6>
    </div>

    <apexchart
      :type="type"
      height="220"
      :options="chartOptions"
      :series="series"
    ></apexchart>
  </div>
</template>

<script>
import VueApexCharts from "vue3-apexcharts"

export default {
  name: "ApexGraph",
  components: { apexchart: VueApexCharts },
  props: {
    title: String,
    type: String,
    data: Array,
    categories: Array
  },
  data() {
    return {
      series: [{ name: this.title, data: this.data }],
      chartOptions: {
        chart: {
          background: "transparent",
          foreColor: "#6b7280",
          toolbar: { show: false }
        },
        xaxis: {
          categories: this.categories,
          axisBorder: { show: false },
          axisTicks: { show: false }
        },
        yaxis: {
          labels: {
            style: { colors: "#6b7280" }
          }
        },
        grid: {
          borderColor: "#f1f1f1",
          strokeDashArray: 4
        },
        dataLabels: { enabled: false },
        stroke: {
          curve: "smooth",
          width: 3
        },
        colors: ["#4f46e5"], // modern indigo accent
        tooltip: {
          theme: "light"
        }
      }
    }
  }
}
</script>

<style scoped>
.graph-card {
  background: linear-gradient(145deg, #ffffff, #f9fafb);
  border-radius: 16px;
  padding: 20px;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.06),
    0 2px 6px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  border: 1px solid #f1f1f1;
}

.graph-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.08),
    0 4px 10px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.card-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
  letter-spacing: 0.3px;
}
</style>