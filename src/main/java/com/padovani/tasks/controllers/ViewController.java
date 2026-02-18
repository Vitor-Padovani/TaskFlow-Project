package com.padovani.tasks.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class ViewController {

    @GetMapping("/task-lists/{id}")
    public String taskPage(@PathVariable String id) {
        // O "forward:" mantém a URL no navegador como /task-lists/uuid
        // mas carrega o conteúdo do tasks.html que está em static
        return "forward:/tasks.html";
    }
}