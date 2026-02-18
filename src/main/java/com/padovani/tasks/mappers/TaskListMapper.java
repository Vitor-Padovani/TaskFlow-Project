package com.padovani.tasks.mappers;

import com.padovani.tasks.domain.dto.TaskListDto;
import com.padovani.tasks.domain.entities.TaskList;;

public interface TaskListMapper {

    TaskList fromDto(TaskListDto taskListDto);

    TaskListDto toDto(TaskList taskList);
}
