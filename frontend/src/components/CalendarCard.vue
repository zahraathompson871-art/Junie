<template>
<DarkCard>
<h5>Your Growth Calendar</h5>

<div class="d-flex flex-wrap gap-2 mt-2">
<span v-for="d in 30" :key="d"
:class="['p-2 rounded', d==today?'bg-primary':'bg-dark']">
{{d}}
</span>
</div>

</DarkCard>
</template>

<script>
import DarkCard from "./DarkCard.vue"
export default {
 components:{DarkCard},
 data(){ return { today: 8 } }
}
</script>
