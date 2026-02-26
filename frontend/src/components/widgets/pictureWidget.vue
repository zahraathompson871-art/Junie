<template>
  <div class="picture-widget">


    <div v-if="data.src" class="picture-frame">
      <img :src="data.src" alt="User Image" class="img-fluid"/>
    </div>
    <img v-else src="https://i.pinimg.com/736x/b3/8d/cc/b38dcc01877a6cce3e55216552652f18.jpg" alt="Placeholder" class="img-fluid mb-2"/>
    <input type="file" @change="onFileChange" accept="image/*" class="form-control mt-2"/>
  </div>
</template>

<script>
export default {
  name: "PictureWidget",
  props: {
    data: {
      type: Object,
      default: () => ({
        src: ""
      })
    }
  },
  methods: {
    onFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => {
          this.$emit("update:data", { src: e.target.result });
        };
        reader.readAsDataURL(file);
      }
    }
  }
}
</script>

<style scoped>
.picture-title {
  font-size: 1.2rem;
  margin-bottom: 8px;
  color: #000;
  text-transform: uppercase;
  letter-spacing: 1px;
}


.picture-frame {
  border: 1px solid #e0e0e0; 
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 10px;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  display: flex;
  align-items: stretch; 
}


.picture-frame img {
  width: 100%;
  height: 100%;          
  object-fit: cover;     
  display: block;
}


.picture-widget {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  max-width: 100%;
  height: 100%; 
  overflow: hidden;
}


.picture-widget img {
  width: 100%;
  height: 100%;  
  object-fit: cover; 
  border-radius: 12px;
}
</style>
