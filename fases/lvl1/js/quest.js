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

function renderQuestUI() {
    if (!questState.isActive) {
        missionLogElement.style.display = 'none';
        return;
    }

    missionLogElement.style.display = 'block';
    missionLogElement.querySelector('h2').innerText = questState.title;
    
    // Limpa a lista de tarefas antiga
    taskListElement.innerHTML = '';

    // Encontra o índice da primeira tarefa incompleta
    const currentTaskIndex = questState.tasks.findIndex(task => !task.completed);

    // Se não encontrou tarefas incompletas, todas estão concluídas
    if (currentTaskIndex === -1) {
        // Pega a última tarefa da lista para exibir como finalizada
        const lastTask = questState.tasks[questState.tasks.length - 1];
        if (lastTask) {
            const li = document.createElement('li');
            li.innerHTML = `✅ ${lastTask.text}`;
            li.classList.add('completed');
            taskListElement.appendChild(li);

            // Adiciona uma mensagem de "Missão Concluída"
            const completionLi = document.createElement('li');
            completionLi.innerText = "Missão Concluída!";
            completionLi.style.fontWeight = 'bold';
            completionLi.style.color = '#32CD32';
            taskListElement.appendChild(completionLi);
        }
        return;
    }

    // Pega a tarefa atual e a próxima
    const currentTask = questState.tasks[currentTaskIndex];
    const nextTask = questState.tasks[currentTaskIndex + 1]; // Será 'undefined' se não houver próxima
    
    // Renderiza a tarefa ATUAL
    if (currentTask) {
        const li = document.createElement('li');
        // A tarefa atual sempre está incompleta, então o checkbox é 🔲
        li.innerHTML = `🔲 ${currentTask.text}`;
        li.classList.add('current-task'); // Adiciona a classe para destaque
        taskListElement.appendChild(li);
    }

    // Renderiza a PRÓXIMA tarefa, se ela existir
    if (nextTask) {
        const li = document.createElement('li');
        li.innerHTML = `🔲 ${nextTask.text}`;
        li.classList.add('next-task'); // Adiciona a classe para estilo sutil
        taskListElement.appendChild(li);
    }
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