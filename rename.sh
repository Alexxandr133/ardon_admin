#!/bin/bash

# Укажите путь к папке
FOLDER_PATH="C:\Users\saw15\Desktop\ardon_admin"

# Проверяем, существует ли папка
if [ ! -d "$FOLDER_PATH" ]; then
  echo "Папка $FOLDER_PATH не существует."
  exit 1
fi

# Итерируемся по всем файлам в папке
for FILE in "$FOLDER_PATH"/*; do
  # Проверяем, является ли элемент файлом (а не папкой)
  if [ -f "$FILE" ]; then
    # Получаем только имя файла (без пути)
    FILENAME=$(basename "$FILE")
    
    # Разделяем имя файла на корень и расширение
    EXTENSION="${FILENAME##*.}"
    
    # Если расширение совпадает с именем файла (т.е. расширения нет)
    if [ "$EXTENSION" = "$FILENAME" ]; then
      # Создаем новое имя файла с расширением .html
      NEW_FILENAME="${FILENAME}.html"
      NEW_FILE_PATH="$FOLDER_PATH/$NEW_FILENAME"
      
      # Переименовываем файл
      mv "$FILE" "$NEW_FILE_PATH"
      echo "Файл переименован: $FILENAME -> $NEW_FILENAME"
    else
      echo "Файл $FILENAME уже имеет расширение, пропускаем."
    fi
  fi
done