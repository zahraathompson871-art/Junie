<template>
<DarkCard>
 <h5>{{title}}</h5>

 <div class="progress mt-3">
  <div class="progress-bar bg-primary"
   :style="{width:value+'%'}"></div>
 </div>

 <small>{{value}}% to your goal 🚀</small>
</DarkCard>
</template>

<script>
import DarkCard from "./DarkCard.vue"
export default { props:["title","value"], components:{DarkCard} }
</script>
