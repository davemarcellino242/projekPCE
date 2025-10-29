document.addEventListener('DOMContentLoaded', function () {

    const taskInput = document.getElementById('new-task');
    const addBtn = document.getElementById('add-btn');
    const taskList = document.getElementById('task-list');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const totalTasksEl = document.getElementById('total-tasks');
    const completedTasksEl = document.getElementById('completed-tasks');
    const themeButtons = document.querySelectorAll('.theme-btn');
    const priorityOptions = document.querySelectorAll('.priority-option');
    const modeToggle = document.getElementById('mode-toggle');
    const prioritySelector = document.getElementById('priority-selector');
    const prioritySlider = document.getElementById('priority-slider');
    const taskDateInput = document.getElementById('task-date');
    const taskTimeInput = document.getElementById('task-time');
    const taskDescInput = document.getElementById('new-task-description');
    const modalOverlay = document.getElementById('edit-modal-overlay');
    const editForm = document.getElementById('edit-form');
    const editTaskId = document.getElementById('edit-task-id');
    const editTaskTitle = document.getElementById('edit-task-title');
    const editTaskDesc = document.getElementById('edit-task-description');
    const editTaskDate = document.getElementById('edit-task-date');
    const editTaskTime = document.getElementById('edit-task-time');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const saveEditBtn = document.getElementById('save-edit-btn');
    const searchInput = document.getElementById('search-task');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    let currentSearchTerm = '';
    let currentPriority = 'medium';
    let currentTheme = 'purple-blue';
    let darkMode = localStorage.getItem('darkMode') !== 'false';

    document.documentElement.style.setProperty('--primary-rgb', '138, 43, 226');
    document.documentElement.style.setProperty('--secondary-rgb', '0, 198, 251');
    document.documentElement.style.setProperty('--success-rgb', '0, 230, 118');
    document.documentElement.style.setProperty('--danger-rgb', '255, 77, 77');

    function init() {
        setTheme(darkMode ? 'dark' : 'light');


        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const time = now.getHours().toString().padStart(2, '0') + ':' +
            now.getMinutes().toString().padStart(2, '0');

        taskDateInput.value = today;
        taskTimeInput.value = time;

        renderTasks();
        updateStats();
        setupEventListeners();
        applyColorTheme(currentTheme);
        updatePrioritySlider();

        setTimeout(() => {
            prioritySelector.style.transform = 'scale(1.05)';
            setTimeout(() => {
                prioritySelector.style.transform = 'scale(1)';
            }, 300);
        }, 500);
    }


    function updatePrioritySlider() {
        const selectedOption = document.querySelector('.priority-option.selected');
        if (selectedOption) {
            const optionRect = selectedOption.getBoundingClientRect();
            const containerRect = prioritySelector.getBoundingClientRect();

            const left = optionRect.left - containerRect.left - 3;
            prioritySlider.style.transform = `translateX(${left}px)`;

            let color;
            switch (currentPriority) {
                case 'high':
                    color = 'var(--high-priority)';
                    break;
                case 'medium':
                    color = 'var(--medium-priority)';
                    break;
                case 'low':
                    color = 'var(--low-priority)';
                    break;
            }
            prioritySlider.style.boxShadow = `0 0 10px ${color}`;
        }
    }


    function setupEventListeners() {
        addBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') addTask();
        });

        filterButtons.forEach(button => {
            button.addEventListener('click', function () {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.filter;
                renderTasks();
            });
        });

        themeButtons.forEach(button => {
            button.addEventListener('click', function () {
                themeButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                currentTheme = this.dataset.theme;
                applyColorTheme(currentTheme);
            });
        });

        priorityOptions.forEach(option => {
            option.addEventListener('click', function () {
                priorityOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                currentPriority = this.dataset.priority.toLowerCase();
                updatePrioritySlider();


                this.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    this.style.transform = 'scale(1.05)';
                }, 200);
            });
        });

        modeToggle.addEventListener('click', toggleDarkMode);


        window.addEventListener('resize', updatePrioritySlider);
        editForm.addEventListener('submit', handleSaveEdit);
        cancelEditBtn.addEventListener('click', closeEditModal);

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeEditModal();
            }
        });

        searchInput.addEventListener('input', () => {
            currentSearchTerm = searchInput.value.trim().toLowerCase();
            renderTasks();
        });
    }

    function toggleDarkMode() {
        darkMode = !darkMode;
        localStorage.setItem('darkMode', darkMode);
        setTheme(darkMode ? 'dark' : 'light');


        modeToggle.style.transform = 'scale(1.2) rotate(180deg)';
        setTimeout(() => {
            modeToggle.style.transform = 'scale(1) rotate(0)';
        }, 300);
    }


    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        modeToggle.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        modeToggle.setAttribute('title', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    }

    function applyColorTheme(theme) {
        let primary, primaryDark, secondary;

        switch (theme) {
            case 'purple-blue':
                primary = '#8a2be2';
                primaryDark = '#5f1d9e';
                secondary = '#00c6fb';
                break;
            case 'red-yellow':
                primary = '#ff4d4d';
                primaryDark = '#d63031';
                secondary = '#fdcb6e';
                break;
            case 'green-blue':
                primary = '#00b894';
                primaryDark = '#00a884';
                secondary = '#0984e3';
                break;
            case 'purple-pink':
                primary = '#6c5ce7';
                primaryDark = '#5649d2';
                secondary = '#fd79a8';
                break;
            case 'orange-yellow':
                primary = '#e17055';
                primaryDark = '#d63031';
                secondary = '#fdcb6e';
                break;
            default:
                primary = '#8a2be2';
                primaryDark = '#5f1d9e';
                secondary = '#00c6fb';
        }

        document.documentElement.style.setProperty('--primary', primary);
        document.documentElement.style.setProperty('--primary-dark', primaryDark);
        document.documentElement.style.setProperty('--secondary', secondary);


        const primaryRgb = hexToRgb(primary).join(', ');
        const secondaryRgb = hexToRgb(secondary).join(', ');
        document.documentElement.style.setProperty('--primary-rgb', primaryRgb);
        document.documentElement.style.setProperty('--secondary-rgb', secondaryRgb);


        updatePrioritySlider();
    }


    function hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
    }

    function addTask() {
        const taskText = taskInput.value.trim();
        const taskDescription = taskDescInput.value.trim();
        if (taskText === '') {
            animateInputError();
            return;
        }

        const date = taskDateInput.value;
        const time = taskTimeInput.value;
        let formattedDate = '';

        if (date) {
            const dateObj = new Date(date);
            formattedDate = dateObj.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });

            if (time) {
                const [hours, minutes] = time.split(':');
                dateObj.setHours(parseInt(hours));
                dateObj.setMinutes(parseInt(minutes));
                formattedDate += ` at ${time}`;
            }
        }

        const newTask = {
            id: Date.now(),
            text: taskText,
            description: taskDescription,
            completed: false,
            priority: currentPriority,
            createdAt: new Date(),
            dueDate: date,
            dueTime: time,
            formattedDate: formattedDate
        };

        tasks.unshift(newTask);
        saveTasks();
        renderTasks();
        updateStats();
        taskInput.value = '';
        taskDescInput.value = '';
        taskInput.focus();


        setTimeout(() => {
            const taskElement = document.querySelector(`[data-id="${newTask.id}"]`);
            if (taskElement) {
                taskElement.classList.add('task-enter');
                setTimeout(() => {
                    taskElement.classList.remove('task-enter');
                }, 500);
            }
        }, 10);

        addBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            addBtn.style.transform = 'scale(1)';
        }, 150);
    }

    function animateInputError() {
        taskInput.style.borderColor = 'var(--danger)';

        const animation = taskInput.animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-5px)' },
            { transform: 'translateX(5px)' },
            { transform: 'translateX(0)' }
        ], {
            duration: 100,
            iterations: 3
        });

        setTimeout(() => {
            taskInput.style.borderColor = 'var(--card-border)';
        }, 1000);
    }


    function renderTasks() {
        taskList.innerHTML = '';

        let filteredTasks = tasks;
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }

        if (currentSearchTerm !== '') {
            filteredTasks = filteredTasks.filter(task => 
                task.text.toLowerCase().includes(currentSearchTerm)
            );
        }

        if (filteredTasks.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-state';

            if (currentSearchTerm !== '' && tasks.length > 0) {
                emptyMessage.innerHTML = `
                        <i class="fas fa-search"></i>
                        <h3>No tasks found</h3>
                        <p>No tasks match your search for "${searchInput.value}".</p>
                    `;
            }

            else if (currentFilter === 'all') {
                emptyMessage.innerHTML = `
                            <i class="fas fa-tasks"></i>
                            <h3>No tasks yet!</h3>
                            <p>Add your first task to get started</p>
                        `;
            } else if (currentFilter === 'active') {
                emptyMessage.innerHTML = `
                            <i class="fas fa-check-circle"></i>
                            <h3>All tasks completed!</h3>
                            <p>You're doing great</p>
                        `;
            } else {
                emptyMessage.innerHTML = `
                            <i class="fas fa-clock"></i>
                            <h3>No completed tasks</h3>
                            <p>Complete some tasks to see them here</p>
                        `;
            }

            taskList.appendChild(emptyMessage);
            return;
        }

        filteredTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task ${task.completed ? 'completed' : ''}`;
            taskElement.dataset.id = task.id;

            const priorityClass = `priority-${task.priority}`;
            const priorityIndicator = `<div class="priority-indicator ${priorityClass}"></div>`;

            const descDisplay = task.description ? 
                `<p class="task-description">${task.description}</p>` : '';

            const dateDisplay = task.formattedDate ? `
                        <div class="task-meta">
                            <div class="task-date">
                                <i class="far fa-calendar-alt"></i>
                                <span>${task.formattedDate}</span>
                            </div>
                        </div>
                    ` : '';

            taskElement.innerHTML = `
                        ${priorityIndicator}
                        <label class="checkbox-container">
                            <input type="checkbox" ${task.completed ? 'checked' : ''}>
                            <span class="checkmark"></span>
                        </label>
                        <div class="task-content">
                            ${task.text}
                            ${descDisplay}
                            ${dateDisplay}
                        </div>
                        <div class="task-actions">
                            
                            <button class="task-btn edit-btn" title="Edit task">
                                <i class="fas fa-pencil-alt"></i>
                            </button>
                            <button class="task-btn complete-btn" title="${task.completed ? 'Mark as incomplete' : 'Mark as complete'}">
                                <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
                            </button>
                            <button class="task-btn delete-btn" title="Delete task">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;

            taskList.appendChild(taskElement);

            const checkbox = taskElement.querySelector('input[type="checkbox"]');
            const completeBtn = taskElement.querySelector('.complete-btn');
            const deleteBtn = taskElement.querySelector('.delete-btn');
            const editBtn = taskElement.querySelector('.edit-btn');

            const taskContentEl = taskElement.querySelector('.task-content');

            checkbox.addEventListener('change', () => toggleTaskComplete(task.id));
            completeBtn.addEventListener('click', () => toggleTaskComplete(task.id));
            deleteBtn.addEventListener('click', () => deleteTask(task.id));
            editBtn.addEventListener('click', () => openEditModal(task.id));

        });
    }


    function toggleTaskComplete(taskId) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) return;

        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks();
        renderTasks();
        updateStats();


        const taskElement = document.querySelector(`[data-id="${taskId}"]`);
        if (taskElement) {
            taskElement.style.transform = 'scale(1.05)';
            setTimeout(() => {
                taskElement.style.transform = 'scale(1)';
            }, 200);
        }
    }

    function deleteTask(taskId) {
        const taskElement = document.querySelector(`[data-id="${taskId}"]`);
        if (taskElement) {
            taskElement.classList.add('task-exit');
            setTimeout(() => {
                tasks = tasks.filter(task => task.id !== taskId);
                saveTasks();
                renderTasks();
                updateStats();
            }, 400);
        }
    }


    function updateStats() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;

        totalTasksEl.textContent = `${totalTasks} ${totalTasks === 1 ? 'task' : 'tasks'}`;
        completedTasksEl.textContent = `${completedTasks} completed`;
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function openEditModal(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        editTaskId.value = task.id;
        editTaskTitle.value = task.text;
        editTaskDesc.value = task.description;
        editTaskDate.value = task.dueDate;
        editTaskTime.value = task.dueTime;
        
        modalOverlay.classList.add('active');
    }

    function closeEditModal() {
        modalOverlay.classList.remove('active');
    }

    function handleSaveEdit(e) {
        e.preventDefault(); 

        const taskId = parseInt(editTaskId.value);
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;

        const newTitle = editTaskTitle.value.trim();
        const newDesc = editTaskDesc.value.trim();
        const newDate = editTaskDate.value;
        const newTime = editTaskTime.value;

        if (newTitle === '') return; 

        let newFormattedDate = '';
        if (newDate) {
            const dateObj = new Date(newDate);
            newFormattedDate = dateObj.toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric'
            });
            if (newTime) {
                newFormattedDate += ` at ${newTime}`;
            }
        }   

        tasks[taskIndex].text = newTitle;
        tasks[taskIndex].description = newDesc;
        tasks[taskIndex].dueDate = newDate;
        tasks[taskIndex].dueTime = newTime;
        tasks[taskIndex].formattedDate = newFormattedDate;

        saveTasks();
        renderTasks();
        closeEditModal();
    }
    init();
});
