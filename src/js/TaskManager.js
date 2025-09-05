import TaskCard from "./TaskCard";

export default class TaskManager {
    constructor(parent) {
        this.state = {
            todo: [],
            doing: [],
            done: []
        };

        this.container = document.createElement('div');
        this.container.classList.add('task-board');

        const header = document.createElement('div');
        header.classList.add('task-board__header');
        header.textContent = 'Task Manager Board';
        this.container.appendChild(header);

        this.loadFromStorage();
        this.renderColumns();

        parent.appendChild(this.container);
    }

    loadFromStorage() {
        const data = localStorage.getItem('task-board');
        if (data) {
            this.state = JSON.parse(data);
        }
    }

    saveToStorage() {
        localStorage.setItem('task-board', JSON.stringify(this.state));
    }

    renderColumns() {
        const columnsWrap = document.createElement('div');
        columnsWrap.classList.add('task-board__columns');

        const columnDefs = [
            { key: 'todo', title: 'To Do' },
            { key: 'doing', title: 'In Progress' },
            { key: 'done', title: 'Done' },
        ];

        columnDefs.forEach(({ key, title }) => {
            const col = document.createElement('div');
            col.classList.add('task-column');
            col.dataset.column = key;

            const colTitle = document.createElement('div');
            colTitle.classList.add('task-column__title');
            colTitle.textContent = title;

            const colBody = document.createElement('div');
            colBody.classList.add('task-column__body');

            // Отрисовываем карточки из state
            this.state[key].forEach(content => {
                const card = new TaskCard(content, key);
                card.setDeleteHandler(this.handleDelete.bind(this));
                card.setMoveHandler(this.handleMove.bind(this));
                colBody.appendChild(card.getElement());
            });

            col.appendChild(colTitle);
            col.appendChild(colBody);

            col.appendChild(this.createAddPanel(key, colBody));

            columnsWrap.appendChild(col);
        });

        this.container.appendChild(columnsWrap);
    }

    createAddPanel(columnKey, colBody) {
        const panel = document.createElement('div');
        panel.classList.add('add-panel');

        const addBtn = document.createElement('button');
        addBtn.classList.add('add-panel__button');
        addBtn.textContent = 'Add another card';

        const form = document.createElement('div');
        form.classList.add('add-panel__form');
        form.style.display = 'none';

        const textarea = document.createElement('textarea');
        textarea.classList.add('add-panel__textarea');
        textarea.placeholder = 'Enter a title for this card...';

        const saveBtn = document.createElement('button');
        saveBtn.classList.add('add-panel__save');
        saveBtn.textContent = 'Add Card';

        const cancelBtn = document.createElement('button');
        cancelBtn.classList.add('add-panel__cancel');
        cancelBtn.textContent = 'Cancel';

        form.appendChild(textarea);
        form.appendChild(saveBtn);
        form.appendChild(cancelBtn);

        panel.appendChild(addBtn);
        panel.appendChild(form);

        addBtn.addEventListener('click', () => {
            addBtn.style.display = 'none';
            form.style.display = 'block';
            textarea.focus();
        });

        saveBtn.addEventListener('click', () => {
            const value = textarea.value.trim();
            if (!value) return;

            const card = new TaskCard(value, columnKey);
            card.setDeleteHandler(this.handleDelete.bind(this));
            card.setMoveHandler(this.handleMove.bind(this));

            colBody.appendChild(card.getElement());
            this.state[columnKey].push(value);
            this.saveToStorage();

            textarea.value = '';
            form.style.display = 'none';
            addBtn.style.display = 'block';
        });

        cancelBtn.addEventListener('click', () => {
            textarea.value = '';
            form.style.display = 'none';
            addBtn.style.display = 'block';
        });

        return panel;
    }

    handleDelete(taskCard) {
        const colKey = taskCard.columnKey;
        const idx = this.state[colKey].indexOf(taskCard.content);
        if (idx > -1) {
            this.state[colKey].splice(idx, 1);
            this.saveToStorage();
        }
    }

    handleMove(taskCard, newColumnKey, newIndex) {
        const oldCol = taskCard.columnKey;

        if (!this.state[newColumnKey]) this.state[newColumnKey] = [];

        // удаляем из старой колонки
        const oldIdx = this.state[oldCol].indexOf(taskCard.content);
        if (oldIdx > -1) this.state[oldCol].splice(oldIdx, 1);

        // вставляем в новую
        this.state[newColumnKey].splice(newIndex, 0, taskCard.content);
        taskCard.columnKey = newColumnKey;

        this.saveToStorage();
    }
}
