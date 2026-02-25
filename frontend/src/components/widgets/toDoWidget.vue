<template>
    <div class="widget-card">
        <h5>Tasks</h5>
        <ul>
            <li v-for="(task, index) in tasks" :key="index">
                <input type="checkbox" v-model="task.done"/>
                <span :class="{completed: task.done}">{{ task.text }}</span>
            </li>
        </ul>
    </div>
</template>

<script>
export default{
    props: ['data'],
    data(){
        return{
            tasks: this.data || []
        }
    }
}
</script>
