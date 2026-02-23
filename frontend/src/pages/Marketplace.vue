<template>
<NavBar/>

<div class="container mt-5">

<h3>Trending Kits 🔥</h3>

 <div class="row mt-3">
      <div 
        class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4"
        v-for="p in products"
        :key="p.id"
      >
        <ProductCard :p="p"/>
      </div>
    </div>
</div>
</template>

<script>
import NavBar from "../components/NavBar.vue"
import ProductCard from "../components/ProductCard.vue"

export default {
 components:{NavBar,ProductCard},
 data(){
  return {
   products:[
    {id:1,title:"Exam Planner",price:5,image:"https://s3.us-west-2.amazonaws.com/public.notion-static.com/template/af595f65-16bd-4ada-a932-86e92173e24c/1717054002363/desktop.jpg"},
    {id:2,title:"Habit Tracker",price:4,image:"https://templatelab.com/wp-content/uploads/2022/04/habit-tracker-template-06-scaled.jpg"},
    {id:3,title:"Creator Kit",price:8,image:"https://m.media-amazon.com/images/I/71DFWezLPkL.jpg"},
    {id:4,title:"CV Builder",price:3,image:"https://cdn-images.zety.com/images/zety/landings/builder/uk/cv-builder-templates@3x.png"},
   ]
  }
 }
}
</script>
