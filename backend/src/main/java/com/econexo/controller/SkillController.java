package com.econexo.controller;

import com.econexo.dto.SkillRequest;
import com.econexo.dto.SkillResponse;
import com.econexo.service.SkillService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
public class SkillController {

    private final SkillService service;

    public SkillController(SkillService service) {
        this.service = service;
    }

    @GetMapping
    public List<SkillResponse> listarTodas() {
        return service.listarTodas();
    }

    @PostMapping
    public ResponseEntity<SkillResponse> salvar(@Valid @RequestBody SkillRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.salvar(req));
    }
}
