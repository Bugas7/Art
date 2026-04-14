# PHOTO_UPDATE_GUIDE (Grand Sync Edition)

Этот мастер-гайд определяет процесс синхронизации веб-сайта портфолио с профилем на Singulart. Мы используем полуавтоматический подход: сначала получаем список всех работ, затем скачиваем недостающие фотографии в высоком разрешении.

## Общий процесс (3 этапа)

### Этап 1: Синхронизация каталога
**Цель**: Получить 100% точный список всех работ и ID.
- Используйте **SINGULART_CATALOG_GUIDE.md** для извлечения всех ссылок и ID.
- Команда для запуска:
  ```bash
  python3 scripts/fetch_singulart_catalog.py \
      --artist-url "https://www.singulart.com/en/artist/iryna-barabash-63359" \
      --output SINGULART_ARTWORK_CATALOG.md
  ```
- Сравните файл `SINGULART_ARTWORK_CATALOG.md` с текущим состоянием проекта, чтобы найти новые работы (отмечены как ❌ Нет).

### Этап 2: Получение ассетов (High-Res)
**Цель**: Получить чистые PNG изображения (Main, Interior, Detail).
- Для каждой новой картины из списка выполните скачивание по инструкции **SINGULART_IMAGE_DOWNLOAD_GUIDE.md**.
- Используйте скрипт:
  ```bash
  python3 scripts/download_singulart_artwork.py \
      --url "URL_КАРТИНЫ_С_SINGULART" \
      --output-dir "./public/images/artworks/SLUG_КАРТИНЫ" \
      --artwork-id "ID_КАРТИНЫ" \
      --artwork-slug "SLUG_КАРТИНЫ"
  ```
- Скрипт автоматически:
  1. Найдет прямые ссылки на CDN.
  2. Выберет максимальное разрешение.
  3. Сконвертирует WebP -> PNG.
  4. Сохранит файлы как `main.png`, `interior-1.png` и т.д.

### Этап 3: Интеграция в код
**Цель**: Отобразить изменения на сайте.
- Обновите файл `src/data/artworks.ts`, добавив новые объекты.
- Убедитесь, что пути к изображениям соответствуют созданной папке в `public/images/artworks/`.
- Используйте скрипт автоматизации (если доступен) для пересборки файла данных:
  ```bash
  node scripts/update-artworks.js
  ```

---

## Структура папок
Все изображения должны храниться строго по схеме:
```text
/public/images/artworks/
  ├── [artwork-slug]/
  │   ├── main.png         # Главное фото
  │   ├── interior-1.png   # Фото в интерьере
  │   ├── detail-1.png     # Детали работы
  │   └── metadata.json    # (Опционально) Технические данные
```

## Полезные инструкции
- [SINGULART_CATALOG_GUIDE.md](./SINGULART_CATALOG_GUIDE.md) — как получить список работ.
- [SINGULART_IMAGE_DOWNLOAD_GUIDE.md](./SINGULART_IMAGE_DOWNLOAD_GUIDE.md) — как скачивать фото.
- [AGENTS.md](./AGENTS.md) — инструкции для ИИ-агентов.
