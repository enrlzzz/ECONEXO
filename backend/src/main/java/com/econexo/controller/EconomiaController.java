package com.econexo.controller;

import com.econexo.dto.EconomiaRequest;
import com.econexo.dto.EconomiaResponse;
import com.econexo.service.EconomiaService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/economia")
public class EconomiaController {
    private final EconomiaService service;
    public EconomiaController(EconomiaService service) { this.service = service; }
    @PostMapping("/analisar")
    public EconomiaResponse analisar(@Valid @RequestBody EconomiaRequest request) { return service.analisar(request); }
}
