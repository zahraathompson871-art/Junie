<template>
<NavBar/>

<div class="container mt-5">
<DarkCard>
<h4>30-Day Study Glow-Up</h4>
<button class="btn-glow">Join Challenge</button>
</DarkCard>
</div>
</template>

<script>
import NavBar from "../components/NavBar.vue"
import DarkCard from "../components/DarkCard.vue"
export default { components:{NavBar,DarkCard} }
</script>
