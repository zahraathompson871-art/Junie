<template>
    <div class="widget-card">
        <h5>Goals</h5>
        <p>{{ data.target }}</p>
        <div class="progress">
            <div class="progress-bar"
                 :style="{width: percentage + '%'}">
                {{ data.current }}/{{ data.total }}
            </div>
        </div>
    </div>
</template>

<script>
export default{
    props: ['data'],
    computed: {
        percentage() {
            if (!this.data?.total) return 0;
            return (this.data.current / this.data.total) * 100;
        }
    }
}
</script>
