# Диаграммы MedPredict для первой предзащиты

Состояние: 16 октября 2026 года. Сплошные элементы обозначают существующий frontend; пунктирные рамки и интеграционные связи — предлагаемые компоненты/взаимодействия. Исключение: «include» в Use Case — стандартная штриховая зависимость UML, а не отметка незавершённой клиентской проверки.

| ID | Диаграмма | Редактируемый источник | Для просмотра | Для Word |
|---|---|---|---|---|
| CTX-01 | Контекст системы | [context.drawio](context.drawio) | [context.svg](context.svg) | [context.png](context.png) |
| UC-01 | Варианты использования | [use-cases.drawio](use-cases.drawio) | [use-cases.svg](use-cases.svg) | [use-cases.png](use-cases.png) |
| CMP-01 | Компоненты и путь обработки | [components.drawio](components.drawio) | [components.svg](components.svg) | [components.png](components.png) |

Файлы `.drawio` содержат несжатый XML с редактируемыми узлами, подписями и связями. Их можно открыть в совместимом diagrams.net, в том числе локальном редакторе. PNG — дополнительный экспорт для редакторов Word без поддержки SVG. Не вставлять PNG вместо editable-источника.

Ни один из M1/M2/M3 пока не реализован. Demo всегда возвращает 134,2 мм рт. ст.; это не результат обученной модели. Существующий HTTP-контракт остаётся `GET /api/v1/model/info` (предложение frontend) и `POST /api/v1/predictions`. Модульный API ещё не согласован.

После редактирования `.drawio` повторно экспортировать SVG и PNG, сравнить подписи/связи, различимость состояний и читаемость при печати. Согласованность поддерживать с [архитектурой](../MedPredict_Architecture.md) и [требованиями](../../requirements/MedPredict_Requirements_Specification.md). Старые артефакты `docs/diagrams/` сохранены.
