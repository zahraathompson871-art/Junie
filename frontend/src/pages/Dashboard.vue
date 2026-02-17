<template>
<NavBar/>

<div class="container mt-4">

<div class="row align-items-center mb-5">

  <div class="col-md-7">
    <h1 class="display-5 fw-bold">Junie</h1>
    <h4 class="text-muted2 mb-3">Your Digital Platform for Growth</h4>

    <button class="btn-glow">
      Level Up Now →
    </button>
  </div>

  <div class="col-md-5">
    <CalendarCard/>
  </div>

</div>

<div class="row g-4 mb-5">

  <div class="col-md-4">
    <DarkCard>
      <h5>Smart Study Tools</h5>
      <p class="text-muted2">
        Achieve more with digital resources
      </p>
    </DarkCard>
  </div>

  <div class="col-md-4">
    <DarkCard>
      <h5>Personal Dashboards</h5>
      <p class="text-muted2">
        Track goals & boost productivity
      </p>
    </DarkCard>
  </div>

  <div class="col-md-4">
    <DarkCard>
      <h5>Global Challenges</h5>
      <p class="text-muted2">
        Join monthly growth challenges
      </p>
    </DarkCard>
  </div>

</div>

<h4 class="mb-3">Trending Products</h4>

<div class="row g-4 mb-5">
  <div class="col-md-3" v-for="p in products" :key="p.id">
    <ProductCard :p="p"/>
  </div>
</div>

<div class="row g-4 mb-5">

  <div class="col-md-6">
    <DarkCard>
      <div class="d-flex align-items-center gap-3">
        <img src="https://www.vecteezy.com/free-photos/man"
             class="rounded-circle">

        <div>
          <h5 class="mb-1">Creator Spotlight</h5>
          <p class="text-muted2 mb-1">
            Joshua Williams — Digital Entrepreneur
          </p>
          <button class="btn-glow btn-sm">
            Start Selling
          </button>
        </div>
      </div>
    </DarkCard>
  </div>

  <div class="col-md-6">
    <ProgressCard
      title="Stay Motivated"
      :value="70"
    />
  </div>

</div>

<DarkCard class="p-4 mb-5 glowup-card">
  <div class="row align-items-center text-white">

    <div class="col-md-8">
      <h3>30-Day Glow-Up</h3>
      <p class="text-muted2">
        Join the viral growth challenge
      </p>
      <button class="btn-glow">
        Join Challenge
      </button>
      <p class="text-muted2 mt-2">
        Start Date: Feb 25
      </p>
    </div>

    <div class="col-md-4">

    </div>

  </div>
</DarkCard>

</div>
</template>

<script>
import NavBar from "../components/NavBar.vue"
import DarkCard from "../components/DarkCard.vue"
import CalendarCard from "../components/CalendarCard.vue"
import ProgressCard from "../components/ProgressCard.vue"
import ProductCard from "../components/ProductCard.vue"

export default {
 components:{
  NavBar,
  DarkCard,
  CalendarCard,
  ProgressCard,
  ProductCard
 },
 data(){
  return {
   products:[
    {id:1,title:"Study Planner",price:7,image:"https://www.madetoplan.com/student-planners/dark-mode"},
    {id:2,title:"Portfolio Dashboard",price:9,image:"https://via.placeholder.com/200"},
    {id:3,title:"Aesthetic CV",price:6,image:"https://via.placeholder.com/200"},
    {id:4,title:"Social Branding Kit",price:8,image:"https://via.placeholder.com/200"}
   ]
  }
 }
}
</script>
