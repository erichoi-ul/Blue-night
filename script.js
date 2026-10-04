// ЧАСЫ И ДАТА

function updateClock() {
    const clockTime = document.getElementById("clock-time");
    const clockDate = document.getElementById("clock-date");

    if (!clockTime || !clockDate) {
        return;
    }

    const now = new Date();

    // время
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    clockTime.textContent = `${hours}:${minutes}`;

    // дата
    const date = now.toLocaleDateString("ru-RU", {
        weekday: "long",
        day: "numeric",
        month: "long"
    });

    // первую букву заглавной
    clockDate.textContent =
        date.charAt(0).toUpperCase() + date.slice(1);
}

// обновление сразу при загрузке
updateClock();

// обновление каждую секунду
setInterval(updateClock, 1000);


// BLUE NIGHT — ЗАМЕТКИ

// нахождение элементов заметки
const notesText = document.getElementById("notes-text");
const notesStatus = document.getElementById("notes-status");
const notesClear = document.getElementById("notes-clear");

if (notesText && notesStatus && notesClear) {

    // загрузка сохранённой заметки
    const savedNote = localStorage.getItem("blueNightNote");

    if (savedNote !== null) {
        notesText.value = savedNote;
        notesStatus.textContent = "Сохранено";
    }

    // сохранение текста при изменении
    notesText.addEventListener("input", () => {
        localStorage.setItem("blueNightNote", notesText.value);
        notesStatus.textContent = "Сохранено";
    });

    // очистка заметки
    notesClear.addEventListener("click", () => {
        notesText.value = "";
        localStorage.removeItem("blueNightNote");
        notesStatus.textContent = "Заметка очищена";
        notesText.focus();
    });
}


// BLUE NIGHT — РАСПИСАНИЕ


async function loadSchedule() {
    const description = document.getElementById("schedule-description");
    const scheduleList = document.getElementById("schedule-list");
    const scheduleStatus = document.getElementById("schedule-status");

    if (!description || !scheduleList || !scheduleStatus) {
        return;
    }

    try {
        const response = await fetch("schedule.json");

        if (!response.ok) {
            throw new Error("Не удалось загрузить расписание");
        }

        const schedule = await response.json();

        // заголовок
        description.textContent =
            `${schedule.group} · ${schedule.day}, ${schedule.date}`;

        // очищение старого содержимого
        scheduleList.innerHTML = "";

        // если пар нет
        if (!schedule.lessons || schedule.lessons.length === 0) {
            scheduleList.innerHTML = `
                <div class="no-lessons">
                    Сегодня пар нет
                </div>
            `;

            scheduleStatus.textContent = "Расписание обновлено";
            return;
        }

        // создание карточки пар
        schedule.lessons.forEach(lesson => {
            const lessonElement = document.createElement("div");

            lessonElement.className = "schedule-lesson";

            lessonElement.innerHTML = `
                <div class="lesson-number">
                    ${lesson.number}
                </div>

                <div class="lesson-info">
                    <div class="lesson-time">
                        ${lesson.start} — ${lesson.end}
                    </div>

                    <div class="lesson-subject">
                        ${lesson.subject}
                    </div>

                    <div class="lesson-details">
                        Кабинет ${lesson.room}
                        · ${lesson.teacher}
                    </div>
                </div>
            `;

            scheduleList.appendChild(lessonElement);
        });

        scheduleStatus.textContent = "Расписание обновлено";

    } catch (error) {
        console.error("Ошибка расписания:", error);

        description.textContent = "Не удалось загрузить расписание";

        scheduleList.innerHTML = `
            <div class="no-lessons">
                Проверь подключение к schedule.json
            </div>
        `;

        scheduleStatus.textContent = "Ошибка загрузки";
    }
}

loadSchedule();