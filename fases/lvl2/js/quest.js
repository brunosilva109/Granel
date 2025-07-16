// Arquivo: js/quest.js

// Estado inicial da missão
let questState = {
    isActive: false,
    title: "",
    tasks: [] // Formato da task: { id: string, text: string, completed: boolean }
};

// Referências para os elementos da UI
const missionLogElement = document.getElementById('mission-log');
const taskListElement = document.getElementById('task-list');

/**
 * Renderiza/atualiza a aba de missões na tela com base no estado atual.
 */
function renderQuestUI() {
    if (!questState.isActive) {
        missionLogElement.style.display = 'none';
        return;
    }

    missionLogElement.style.display = 'block';
    missionLogElement.querySelector('h2').innerText = questState.title;
    
    // Limpa a lista de tarefas antiga
    taskListElement.innerHTML = '';

    // Cria e adiciona cada item da lista de tarefas
    questState.tasks.forEach(task => {
        const li = document.createElement('li');
        const checkbox = task.completed ? '✅' : '🔲';
        li.innerHTML = `${checkbox} ${task.text}`;

        if (task.completed) {
            li.classList.add('completed');
        }
        
        taskListElement.appendChild(li);
    });
}
export function isTaskCompleted(taskId) {
    if (!questState.isActive) return false;

    const task = questState.tasks.find(t => t.id === taskId);
    return task ? task.completed : false;
}
export function startQuest(title, tasks) {
    questState = {
        isActive: true,
        title: title,
        tasks: tasks
    };
    renderQuestUI();
}

/**
 * Marca uma tarefa específica como completa.
 * @param {string} taskId - O 'id' da tarefa a ser completada.
 */
export function completeTask(taskId) {
    if (!questState.isActive) return;

    const task = questState.tasks.find(t => t.id === taskId);
    if (task && !task.completed) {
        task.completed = true;
        renderQuestUI();
    }
}

/**
 * Atualiza o texto de uma tarefa (ex: para mostrar progresso).
 * @param {string} taskId - O 'id' da tarefa a ser atualizada.
 * @param {string} newText - O novo texto para a tarefa.
 */
export function updateTaskText(taskId, newText) {
    if (!questState.isActive) return;

    const task = questState.tasks.find(t => t.id === taskId);
    if (task) {
        task.text = newText;
        renderQuestUI();
    }
}

/**
 * Finaliza e esconde a missão atual.
 */
export function endQuest() {
    questState.isActive = false;
    renderQuestUI();
}