<template>
    <div class="widget-card">
        <div class="header">
            <h5 class="title">Tasks</h5>
            <span class="counter">
                {{ completedTasks }}/{{ tasks.length }}
            </span>
        </div>

        <!-- Add Task Section -->
        <div class="add-task-section">
            <button 
                v-if="!showInput"
                class="add-btn"
                @click="showInput = true"
            >
                + Add New Task
            </button>

            <div v-else class="input-group">
                <input
                    v-model="newTask"
                    @keyup.enter="addTask"
                    type="text"
                    placeholder="Enter task..."
                    class="task-input"
                />
                <button class="save-btn" @click="addTask">
                    Add
                </button>
                <button class="cancel-btn" @click="cancelAdd">
                    Cancel
                </button>
            </div>
        </div>

        <div v-if="tasks.length === 0" class="empty-state">
            No tasks added
        </div>

        <ul v-else class="task-list">
            <li 
                v-for="(task, index) in tasks" 
                :key="index"
                class="task-item"
            >
                <label class="task-label">
                    <input 
                        type="checkbox" 
                        v-model="task.done"
                        class="checkbox"
                    />
                    <span 
                        :class="['task-text', { completed: task.done }]"
                    >
                        {{ task.text }}
                    </span>
                </label>
            </li>
        </ul>

        <div v-if="tasks.length" class="progress-wrapper">
            <div 
                class="progress-bar"
                :style="{ width: progress + '%' }"
                :class="{ complete: progress === 100 }"
            ></div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['data'],
    data() {
        return {
            tasks: this.data || [],
            showInput: false,
            newTask: ''
        }
    },
    computed: {
        completedTasks() {
            return this.tasks.filter(task => task.done).length
        },
        progress() {
            if (!this.tasks.length) return 0
            return (this.completedTasks / this.tasks.length) * 100
        }
    },
    methods: {
        addTask() {
            if (!this.newTask.trim()) return

            this.tasks.push({
                text: this.newTask,
                done: false
            })

            this.newTask = ''
            this.showInput = false
        },
        cancelAdd() {
            this.newTask = ''
            this.showInput = false
        }
    }
}
</script>

<style scoped>
.widget-card {
    background-color: #ffffff;
    padding: 24px;
    border-radius: 12px;
    border: 1px solid #e5e5e5;
    width: 100%;
    max-width: 350px;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.04);
    font-family: Arial, sans-serif;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.title {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: #222222;
}

.counter {
    font-size: 13px;
    font-weight: 600;
    color: #4a90e2;
}

/* Add Task Section */
.add-task-section {
    margin-bottom: 15px;
}

.add-btn {
    width: 100%;
    padding: 8px;
    background-color: #4a90e2;
    color: #ffffff;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
}

.add-btn:hover {
    background-color: #3d7cc4;
}

.input-group {
    display: flex;
    gap: 6px;
}

.task-input {
    flex: 1;
    padding: 6px 8px;
    border: 1px solid #cccccc;
    border-radius: 6px;
    font-size: 13px;
}

.save-btn {
    background-color: #2ecc71;
    color: white;
    border: none;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
}

.cancel-btn {
    background-color: #999999;
    color: white;
    border: none;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
}

.empty-state {
    font-size: 14px;
    color: #999999;
    text-align: center;
    padding: 20px 0;
}

.task-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.task-item {
    padding: 10px 0;
    border-bottom: 1px solid #f2f2f2;
}

.task-item:last-child {
    border-bottom: none;
}

.task-label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
}

.checkbox {
    width: 16px;
    height: 16px;
    accent-color: #4a90e2;
}

.task-text {
    font-size: 14px;
    color: #444444;
}

.task-text.completed {
    text-decoration: line-through;
    color: #999999;
}

.progress-wrapper {
    margin-top: 15px;
    background-color: #f0f0f0;
    border-radius: 20px;
    height: 6px;
    overflow: hidden;
}

.progress-bar {
    background-color: #4a90e2;
    height: 100%;
    transition: width 0.3s ease;
}

.progress-bar.complete {
    background-color: #2ecc71;
}
</style>