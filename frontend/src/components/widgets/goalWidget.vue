<template>
    <div class="widget-card">
        <div class="header">
            <h5 class="title">Goals</h5>
            <span class="percentage">{{ Math.round(percentage) }}%</span>
        </div>

        <p class="target">{{ data.target }}</p>

        <div class="progress-wrapper">
            <div 
                class="progress-bar"
                :class="{ complete: percentage >= 100 }"
                :style="{ width: percentage + '%' }"
            >
                <span class="progress-text">
                    {{ data.current }} / {{ data.total }}
                </span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['data'],
    computed: {
        percentage() {
            if (!this.data?.total) return 0
            return Math.min(
                (this.data.current / this.data.total) * 100,
                100
            )
        }
    }
}
</script>

<style scoped>
.widget-card {
    background-color: #ffffff;
    padding: 24px;
    border-radius: 12px;
    border: 1px solid #e5e5e5;
    width: 100%;
    max-width: 350px;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.04);
    font-family: Arial, sans-serif;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.title {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: #222222;
}

.percentage {
    font-size: 13px;
    font-weight: 600;
    color: #4a90e2;
}

.target {
    margin: 0 0 16px 0;
    font-size: 14px;
    color: #555555;
}

.progress-wrapper {
    background-color: #f0f0f0;
    border-radius: 30px;
    height: 24px;
    overflow: hidden;
}

.progress-bar {
    background-color: #4a90e2; /* primary blue */
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: width 0.4s ease;
    border-radius: 30px;
}

.progress-bar.complete {
    background-color: #2ecc71; /* solid green when done */
}

.progress-text {
    font-size: 12px;
    color: #ffffff;
    font-weight: 500;
}
</style>