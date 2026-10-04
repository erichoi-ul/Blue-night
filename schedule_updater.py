import json
import re
from pathlib import Path


# НАСТРОЙКИ

BASE_DIR = Path(__file__).parent
SCHEDULE_FILE = BASE_DIR / "schedule.json"



# ТЕКСТ ОТ TELEGRAM-БОТА

# сообщение вручную
# позже подключение Telegram

telegram_message = """
🍁 Пары ИС-21 на сегодня (1 корпус):

**— Пара 3** | Элементы высшей математики 
Кабинет: 323
Преподаватель: Джалагония М.Ш.
Время: 11:30  —  13:00

**— Пара 4** | Основы алгоритмизации и программирования 
Кабинет: 420
Преподаватель: Манакова О.П.
Время: 13:10  —  14:40

**— Пара 5** | Информационные технологии 
Кабинет: 312
Преподаватель: Бурда Е.Г.
Время: 15:00  —  16:30

**— Пара 6** | Основы алгоритмизации и программирования 
Кабинет: 420
Преподаватель: Манакова О.П.
Время: 16:40  —  18:10
"""


# ОЧИСТКА ТЕКСТА

def clean_text(text):
    """Убирает лишние пробелы и Markdown."""

    text = text.replace("**", "")
    text = text.replace("🍁", "")

    return text.strip()


# ОПРЕДЕЛЕНИЕ ГРУППЫ

def parse_group(text):
    match = re.search(r"Пары\s+([А-ЯA-ZЁ0-9-]+)", text)

    if match:
        return match.group(1)

    return "Неизвестная группа"


# ОПРЕДЕЛЕНИЕ КОРПУСА

def parse_building(text):
    match = re.search(r"\(([^)]+)\)", text)

    if match:
        return match.group(1)

    return ""


# РАЗБОР ПАРЫ

def parse_lessons(text):

    lesson_pattern = re.compile(
        r"Пара\s+(\d+)\s*\|\s*(.+?)\s*"
        r"Кабинет:\s*(.+?)\s*"
        r"Преподаватель:\s*(.+?)\s*"
        r"Время:\s*(\d{1,2}:\d{2})\s*[-—]\s*(\d{1,2}:\d{2})",
        re.MULTILINE
    )

    lessons = []

    matches = lesson_pattern.finditer(text)

    for match in matches:

        number = int(match.group(1))
        subject = match.group(2).strip()
        room = match.group(3).strip()
        teacher = match.group(4).strip()
        start = match.group(5)
        end = match.group(6)

        lessons.append({
            "number": number,
            "subject": subject,
            "room": room,
            "teacher": teacher,
            "start": start,
            "end": end
        })

    return lessons


# СОЗДАНИЕ РАСПИСАНИЯ

def create_schedule(message):

    message = clean_text(message)

    group = parse_group(message)
    building = parse_building(message)
    lessons = parse_lessons(message)

    schedule = {
        "group": group,
        "date": "03.10.2026",
        "day": "Сегодня",
        "building": building,
        "lessons": lessons
    }

    return schedule



# СОХРАНЕНИЕ JSON

def save_schedule(schedule):

    with open(SCHEDULE_FILE, "w", encoding="utf-8") as file:
        json.dump(
            schedule,
            file,
            ensure_ascii=False,
            indent=4
        )


# ЗАПУСК

schedule = create_schedule(telegram_message)

save_schedule(schedule)

print("Расписание успешно обновлено!")
print(f"Группа: {schedule['group']}")
print(f"Корпус: {schedule['building']}")
print(f"Найдено пар: {len(schedule['lessons'])}")

for lesson in schedule["lessons"]:
    print(
        f"{lesson['number']}. "
        f"{lesson['start']} — {lesson['end']} | "
        f"{lesson['subject']}"
    )