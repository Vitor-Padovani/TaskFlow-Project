package com.padovani.tasks.mappers;

import com.padovani.tasks.domain.dto.TaskDto;
import com.padovani.tasks.domain.entities.Task;

public interface TaskMapper {

    Task fromDto(TaskDto taskDto);

    TaskDto toDto(Task task);
}
