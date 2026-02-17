<template>
<NavBar/>

<div class="container mt-5">
<DarkCard>

<h4>Publish Your Kit</h4>

<input class="form-control mb-2" placeholder="Kit title">
<textarea class="form-control mb-3" placeholder="Description"/>

<button class="btn-glow">Publish Kit</button>

</DarkCard>
</div>
</template>

<script>
import NavBar from "../components/NavBar.vue"
import DarkCard from "../components/DarkCard.vue"
export default { components:{NavBar,DarkCard} }
</script>
