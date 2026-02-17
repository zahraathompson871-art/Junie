<template>
<DarkCard>
<img :src="p.image" class="w-100 rounded mb-2" style="height: 150px; object-fit: cover;">
<h5>{{p.title}}</h5>
<p class="text-muted2">${{p.price}}</p>
<button class="btn-glow btn-sm w-100">Add to Cart</button>
</DarkCard>
</template>

<script>
import DarkCard from "./DarkCard.vue"
export default {
 components:{DarkCard},
 props:{
  p:Object
 }
}
</script>
