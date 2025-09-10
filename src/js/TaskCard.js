export default class TaskCard {
    constructor(content, columnKey) {
        this.content = content;
        this.columnKey = columnKey;

        this.el = document.createElement('div');
        this.el.classList.add('task-card');

        this.textEl = document.createElement('div');
        this.textEl.classList.add('task-card__text');
        this.textEl.textContent = this.content;
        this.el.append(this.textEl);

        this.deleteBtn = document.createElement('button');
        this.deleteBtn.classList.add('task-card__delete');
        this.deleteBtn.textContent = '✖';
        this.el.append(this.deleteBtn);

        this.deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.el.remove();
            if (this.onDelete) this.onDelete(this);
        });

        this.el.addEventListener('mousedown', this.onDragStart.bind(this));
    }

    setDeleteHandler(callback) {
        this.onDelete = callback;
    }

    setMoveHandler(callback) {
        this.onMove = callback;
    }

    getElement() {
        return this.el;
    }

    onDragStart(e) {
        if (e.target.closest('.task-card__delete')) return;

        e.preventDefault();

        this.elInitialParent = this.el.parentElement;
        this.elInitialNext = this.el.nextSibling;

        this.dragEl = this.el.cloneNode(true);
        this.dragEl.style.position = 'absolute';
        this.dragEl.style.pointerEvents = 'none';
        this.dragEl.style.width = `${this.el.offsetWidth}px`;
        this.dragEl.style.zIndex = 1000;
        document.body.append(this.dragEl);

        this.offsetX = e.clientX - this.el.getBoundingClientRect().left;
        this.offsetY = e.clientY - this.el.getBoundingClientRect().top;

        this.el.style.display = "none";

        this.placeholder = document.createElement('div');
        this.placeholder.classList.add('task-card', 'placeholder');
        this.placeholder.style.height = `${this.dragEl.offsetHeight}px`;
        this.elInitialParent.insertBefore(this.placeholder, this.el);

        document.addEventListener('mousemove', this.onDragMove);
        document.addEventListener('mouseup', this.onDragEnd);
    }

    onDragMove = (e) => {
        this.dragEl.style.left = `${e.clientX - this.offsetX}px`;
        this.dragEl.style.top = `${e.clientY - this.offsetY}px`;

        const cols = document.querySelectorAll('.task-column__body');
        let inserted = false;

        cols.forEach((col) => {
            const rect = col.getBoundingClientRect();
            if (e.clientX >= rect.left && e.clientX <= rect.right &&
                e.clientY >= rect.top && e.clientY <= rect.bottom) {

                const cards = Array.from(col.querySelectorAll('.task-card:not(.placeholder)'));
                let insertedHere = false;

                for (let card of cards) {
                    const cardRect = card.getBoundingClientRect();
                    if (e.clientY < cardRect.top + cardRect.height / 2) {
                        col.insertBefore(this.placeholder, card);
                        insertedHere = true;
                        break;
                    }
                }

                if (!insertedHere) col.append(this.placeholder);

                this.targetColumnKey = col.closest('.task-column').dataset.column;
                inserted = true;
            }
        });

        if (!inserted) {
            if (this.elInitialNext) {
                this.elInitialParent.insertBefore(this.placeholder, this.elInitialNext);
            } else {
                this.elInitialParent.append(this.placeholder);
            }
            this.targetColumnKey = this.elInitialParent.closest('.task-column').dataset.column;
        }
    }

    onDragEnd = () => {
        const parent = this.placeholder.parentElement;
        const index = Array.from(parent.children).indexOf(this.placeholder);

        this.placeholder.replaceWith(this.el);
        this.el.removeAttribute("style");
        this.elInitialParent = null;

        this.dragEl.remove();
        document.removeEventListener('mousemove', this.onDragMove);
        document.removeEventListener('mouseup', this.onDragEnd);

        if (this.onMove) {
            this.onMove(this, this.targetColumnKey, index);
        }
    }
}
