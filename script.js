// ======================================================
// TASKFLOW - PRODUCTIVITY MANAGER
// ======================================================


// ======================================================
// DOM ELEMENTS
// ======================================================

const taskInput =
    document.getElementById("taskInput");

const categoryInput =
    document.getElementById("categoryInput");

const priorityInput =
    document.getElementById("priorityInput");

const dateInput =
    document.getElementById("dateInput");

const saveTaskBtn =
    document.getElementById("saveTaskBtn");

const cancelEditBtn =
    document.getElementById("cancelEdit");

const formTitle =
    document.getElementById("formTitle");

const taskList =
    document.getElementById("taskList");

const emptyState =
    document.getElementById("emptyState");

const searchInput =
    document.getElementById("searchInput");

const filters =
    document.querySelectorAll(".filter");

const sortSelect =
    document.getElementById("sortSelect");

const clearCompletedBtn =
    document.getElementById("clearCompleted");

const clearAllBtn =
    document.getElementById("clearAll");

const themeBtn =
    document.getElementById("themeBtn");

const toast =
    document.getElementById("toast");


// Stats

const totalTasks =
    document.getElementById("totalTasks");

const completedTasks =
    document.getElementById("completedTasks");

const pendingTasks =
    document.getElementById("pendingTasks");

const overdueTasks =
    document.getElementById("overdueTasks");

const progressPercent =
    document.getElementById("progressPercent");

const progressFill =
    document.getElementById("progressFill");

const taskSummary =
    document.getElementById("taskSummary");


// ======================================================
// APPLICATION STATE
// ======================================================

let tasks =
    JSON.parse(
        localStorage.getItem("taskflow_tasks")
    ) || [];

let currentFilter = "all";

let editingTaskId = null;

let lastDeletedTask = null;


// ======================================================
// LOCAL STORAGE
// ======================================================

function saveTasks() {

    localStorage.setItem(
        "taskflow_tasks",
        JSON.stringify(tasks)
    );
}


// ======================================================
// ADD TASK
// ======================================================

function addTask() {

    const title =
        taskInput.value.trim();

    if (!title) {

        showToast(
            "Please enter a task."
        );

        taskInput.focus();

        return;
    }


    const newTask = {

        id: Date.now(),

        title: title,

        category:
            categoryInput.value,

        priority:
            priorityInput.value,

        dueDate:
            dateInput.value,

        completed: false,

        createdAt:
            new Date().toISOString()
    };


    tasks.unshift(newTask);

    saveTasks();

    resetForm();

    render();

    showToast(
        "Task added successfully ✓"
    );
}


// ======================================================
// UPDATE TASK
// ======================================================

function updateTask() {

    const title =
        taskInput.value.trim();

    if (!title) {

        showToast(
            "Task title cannot be empty."
        );

        return;
    }


    tasks =
        tasks.map(task => {

            if (task.id !== editingTaskId) {

                return task;
            }

            return {

                ...task,

                title,

                category:
                    categoryInput.value,

                priority:
                    priorityInput.value,

                dueDate:
                    dateInput.value
            };
        });


    saveTasks();

    resetForm();

    render();

    showToast(
        "Task updated successfully ✓"
    );
}


// ======================================================
// START EDIT
// ======================================================

function startEdit(id) {

    const task =
        tasks.find(
            task => task.id === id
        );

    if (!task) return;


    editingTaskId = id;


    taskInput.value =
        task.title;

    categoryInput.value =
        task.category;

    priorityInput.value =
        task.priority;

    dateInput.value =
        task.dueDate;


    formTitle.textContent =
        "Edit Task";

    saveTaskBtn.textContent =
        "Save Changes";

    cancelEditBtn.classList.remove(
        "hidden"
    );


    taskInput.focus();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ======================================================
// CANCEL EDIT
// ======================================================

function resetForm() {

    editingTaskId = null;

    taskInput.value = "";

    categoryInput.value =
        "work";

    priorityInput.value =
        "medium";

    dateInput.value = "";


    formTitle.textContent =
        "Add New Task";

    saveTaskBtn.textContent =
        "+ Add Task";

    cancelEditBtn.classList.add(
        "hidden"
    );
}


// ======================================================
// DELETE TASK
// ======================================================

function deleteTask(id) {

    const task =
        tasks.find(
            task => task.id === id
        );

    if (!task) return;


    lastDeletedTask = task;


    tasks =
        tasks.filter(
            task => task.id !== id
        );


    saveTasks();

    render();


    showToast(
        "Task deleted. Click here or press Ctrl+Z to undo.",
        true
    );
}


// ======================================================
// UNDO DELETE
// ======================================================

function undoDelete() {

    if (!lastDeletedTask) {

        return;
    }


    tasks.unshift(
        lastDeletedTask
    );

    saveTasks();

    render();

    lastDeletedTask = null;

    showToast(
        "Task restored ✓"
    );
}


// ======================================================
// TOGGLE COMPLETE
// ======================================================

function toggleTask(id) {

    tasks =
        tasks.map(task => {

            if (task.id !== id) {

                return task;
            }


            return {

                ...task,

                completed:
                    !task.completed
            };
        });


    saveTasks();

    render();
}


// ======================================================
// CHECK OVERDUE
// ======================================================

function isOverdue(task) {

    if (
        !task.dueDate ||
        task.completed
    ) {

        return false;
    }


    const today =
        getToday();


    return task.dueDate < today;
}


// ======================================================
// TODAY DATE
// ======================================================

function getToday() {

    const date =
        new Date();


    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;
}


// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(date) {

    if (!date) {

        return "No due date";
    }


    const formatted =
        new Date(
            date + "T00:00:00"
        );


    return formatted.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );
}


// ======================================================
// GET FILTERED TASKS
// ======================================================

function getFilteredTasks() {

    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    let filtered =
        tasks.filter(task => {

            const matchesSearch =
                task.title
                    .toLowerCase()
                    .includes(search);


            if (!matchesSearch) {

                return false;
            }


            switch (currentFilter) {

                case "active":

                    return !task.completed;


                case "completed":

                    return task.completed;


                case "overdue":

                    return isOverdue(task);


                default:

                    return true;
            }
        });


    return sortTasks(filtered);
}


// ======================================================
// SORT TASKS
// ======================================================

function sortTasks(taskArray) {

    const sortType =
        sortSelect.value;


    const priorityValue = {

        high: 3,

        medium: 2,

        low: 1
    };


    return [...taskArray].sort(
        (a, b) => {

            switch (sortType) {

                case "oldest":

                    return (
                        new Date(a.createdAt) -
                        new Date(b.createdAt)
                    );


                case "priority":

                    return (
                        priorityValue[b.priority] -
                        priorityValue[a.priority]
                    );


                case "dueDate":

                    if (!a.dueDate) return 1;

                    if (!b.dueDate) return -1;

                    return (
                        a.dueDate.localeCompare(
                            b.dueDate
                        )
                    );


                case "alphabetical":

                    return a.title.localeCompare(
                        b.title
                    );


                case "newest":

                default:

                    return (
                        new Date(b.createdAt) -
                        new Date(a.createdAt)
                    );
            }
        }
    );
}


// ======================================================
// RENDER
// ======================================================

function render() {

    const filteredTasks =
        getFilteredTasks();


    taskList.innerHTML = "";


    if (filteredTasks.length === 0) {

        emptyState.style.display =
            "block";

    } else {

        emptyState.style.display =
            "none";
    }


    filteredTasks.forEach(
        task => {

            const element =
                createTaskElement(task);

            taskList.appendChild(
                element
            );
        }
    );


    updateStats();
}


// ======================================================
// CREATE TASK ELEMENT
// ======================================================

function createTaskElement(task) {

    const element =
        document.createElement("div");


    element.className =
        "task";


    if (task.completed) {

        element.classList.add(
            "completed"
        );
    }


    const overdue =
        isOverdue(task);


    element.innerHTML = `

        <div
            class="checkbox"
            data-action="toggle"
            data-id="${task.id}"
        ></div>


        <div class="task-content">

            <div class="task-title">
                ${escapeHTML(task.title)}
            </div>


            <div class="task-meta">

                <span class="badge category">
                    ${getCategoryName(task.category)}
                </span>


                <span
                    class="
                        badge
                        priority-${task.priority}
                    "
                >
                    ${capitalize(task.priority)}
                </span>


                ${
                    task.dueDate
                        ? `
                            <span
                                class="
                                    due-date
                                    ${overdue ? "overdue" : ""}
                                "
                            >
                                ${
                                    overdue
                                        ? "⚠️ Overdue: "
                                        : "📅 "
                                }

                                ${formatDate(task.dueDate)}
                            </span>
                        `
                        : ""
                }

            </div>

        </div>


        <div class="actions">

            <button
                class="action-btn"
                data-action="edit"
                data-id="${task.id}"
                title="Edit task"
            >
                ✏️
            </button>


            <button
                class="action-btn delete-btn"
                data-action="delete"
                data-id="${task.id}"
                title="Delete task"
            >
                🗑️
            </button>

        </div>
    `;


    return element;
}


// ======================================================
// EVENT DELEGATION
// ======================================================

taskList.addEventListener(
    "click",
    event => {

        const target =
            event.target.closest(
                "[data-action]"
            );


        if (!target) return;


        const action =
            target.dataset.action;


        const id =
            Number(
                target.dataset.id
            );


        if (action === "toggle") {

            toggleTask(id);
        }


        if (action === "edit") {

            startEdit(id);
        }


        if (action === "delete") {

            deleteTask(id);
        }
    }
);


// ======================================================
// UPDATE STATISTICS
// ======================================================

function updateStats() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            task => task.completed
        ).length;


    const pending =
        total - completed;


    const overdue =
        tasks.filter(
            task => isOverdue(task)
        ).length;


    const progress =
        total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
            );


    totalTasks.textContent =
        total;


    completedTasks.textContent =
        completed;


    pendingTasks.textContent =
        pending;


    overdueTasks.textContent =
        overdue;


    progressPercent.textContent =
        `${progress}%`;


    progressFill.style.width =
        `${progress}%`;


    taskSummary.textContent =
        `${total} ${
            total === 1
                ? "task"
                : "tasks"
        }`;
}


// ======================================================
// CLEAR COMPLETED
// ======================================================

clearCompletedBtn.addEventListener(
    "click",
    () => {

        const completedCount =
            tasks.filter(
                task => task.completed
            ).length;


        if (completedCount === 0) {

            showToast(
                "No completed tasks."
            );

            return;
        }


        tasks =
            tasks.filter(
                task => !task.completed
            );


        saveTasks();

        render();


        showToast(
            `${completedCount} completed task(s) removed.`
        );
    }
);


// ======================================================
// CLEAR ALL
// ======================================================

clearAllBtn.addEventListener(
    "click",
    () => {

        if (tasks.length === 0) {

            showToast(
                "There are no tasks."
            );

            return;
        }


        const confirmed =
            confirm(
                "Delete all tasks? This cannot be undone."
            );


        if (!confirmed) return;


        tasks = [];

        saveTasks();

        render();

        showToast(
            "All tasks deleted."
        );
    }
);


// ======================================================
// SEARCH
// ======================================================

searchInput.addEventListener(
    "input",
    render
);


// ======================================================
// FILTERS
// ======================================================

filters.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                filters.forEach(
                    btn => {

                        btn.classList.remove(
                            "active"
                        );
                    }
                );


                button.classList.add(
                    "active"
                );


                currentFilter =
                    button.dataset.filter;


                render();
            }
        );
    }
);


// ======================================================
// SORT
// ======================================================

sortSelect.addEventListener(
    "change",
    render
);


// ======================================================
// ADD / UPDATE BUTTON
// ======================================================

saveTaskBtn.addEventListener(
    "click",
    () => {

        if (editingTaskId) {

            updateTask();

        } else {

            addTask();
        }
    }
);


// ======================================================
// CANCEL EDIT
// ======================================================

cancelEditBtn.addEventListener(
    "click",
    resetForm
);


// ======================================================
// KEYBOARD SHORTCUTS
// ======================================================

document.addEventListener(
    "keydown",
    event => {

        // Ctrl + Enter = Save task

        if (
            event.ctrlKey &&
            event.key === "Enter"
        ) {

            if (editingTaskId) {

                updateTask();

            } else {

                addTask();
            }
        }


        // Ctrl + Z = Undo delete

        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "z"
        ) {

            undoDelete();
        }


        // Escape = cancel editing

        if (
            event.key === "Escape" &&
            editingTaskId
        ) {

            resetForm();
        }
    }
);


// ======================================================
// DARK MODE
// ======================================================

themeBtn.addEventListener(
    "click",
    toggleTheme
);


function toggleTheme() {

    document.body.classList.toggle(
        "dark"
    );


    const darkMode =
        document.body.classList.contains(
            "dark"
        );


    localStorage.setItem(
        "taskflow_theme",
        darkMode
            ? "dark"
            : "light"
    );


    themeBtn.textContent =
        darkMode
            ? "☀️"
            : "🌙";
}


// ======================================================
// LOAD THEME
// ======================================================

function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            "taskflow_theme"
        );


    if (savedTheme === "dark") {

        document.body.classList.add(
            "dark"
        );

        themeBtn.textContent =
            "☀️";
    }
}


// ======================================================
// TOAST
// ======================================================

let toastTimer;


function showToast(
    message,
    allowUndo = false
) {

    clearTimeout(toastTimer);


    toast.innerHTML =
        allowUndo
            ? `
                ${escapeHTML(message)}
                <button
                    id="undoBtn"
                    style="
                        margin-left:10px;
                        background:#6366f1;
                        color:white;
                        padding:5px 8px;
                        border-radius:5px;
                    "
                >
                    Undo
                </button>
            `
            : escapeHTML(message);


    toast.classList.add(
        "show"
    );


    if (allowUndo) {

        document
            .getElementById("undoBtn")
            .addEventListener(
                "click",
                () => {

                    undoDelete();

                    toast.classList.remove(
                        "show"
                    );
                }
            );
    }


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3500
        );
}


// ======================================================
// CATEGORY NAME
// ======================================================

function getCategoryName(category) {

    const categories = {

        work: "💼 Work",

        personal: "🏠 Personal",

        study: "📚 Study",

        shopping: "🛒 Shopping",

        other: "📌 Other"
    };


    return (
        categories[category] ||
        "📌 Other"
    );
}


// ======================================================
// CAPITALIZE
// ======================================================

function capitalize(value) {

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );
}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(value) {

    const div =
        document.createElement("div");


    div.textContent =
        value;


    return div.innerHTML;
}


// ======================================================
// INITIALIZATION
// ======================================================

loadTheme();

render();
