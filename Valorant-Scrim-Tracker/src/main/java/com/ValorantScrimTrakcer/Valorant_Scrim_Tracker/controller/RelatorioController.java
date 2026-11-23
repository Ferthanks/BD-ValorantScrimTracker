package com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.controller;

import com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.dao.RelatorioDao;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/relatorios")
public class RelatorioController {

    private final RelatorioDao dao;

    public RelatorioController(RelatorioDao dao) {
        this.dao = dao;
    }

    @GetMapping("/jogadores")
    public List mediaPorJogador() {
        return dao.mediaPorJogador();
    }

    @GetMapping("/mapas")
    public List mediaPorMapa() {
        return dao.mediaPorMapa();
    }

    @GetMapping("/questoes")
    public List mediaPorQuestao() {
        return dao.mediaPorQuestao();
    }

    @GetMapping("/evolucao")
    public List evolucaoScrims() {
        return dao.evolucaoScrims();
    }
}