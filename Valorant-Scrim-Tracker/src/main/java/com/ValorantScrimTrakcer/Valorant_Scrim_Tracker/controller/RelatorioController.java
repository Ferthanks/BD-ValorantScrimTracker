package com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.controller;

import com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.dao.RelatorioDao;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
    public List rankingJogadores(
            @RequestParam(required = false) String dataInicio,
            @RequestParam(required = false) String dataFim,
            @RequestParam(required = false) String nick,
            @RequestParam(required = false) List<String> funcoes,
            @RequestParam(required = false) Integer minAvaliacoes
    ) {
        return dao.rankingJogadores(dataInicio, dataFim, nick, funcoes, minAvaliacoes);
    }

    @GetMapping("/evolucao")
    public List evolucaoScrims(
            @RequestParam(required = false) String dataInicio,
            @RequestParam(required = false) String dataFim,
            @RequestParam(required = false) List<String> mapas
    ) {
        return dao.evolucaoScrims(dataInicio, dataFim, mapas);
    }

    @GetMapping("/questoes")
    public List rankingQuestoes(
            @RequestParam(required = false) List<String> tipos,
            @RequestParam(required = false) String ordem,
            @RequestParam(required = false) Integer limite
    ) {
        return dao.rankingQuestoes(tipos, ordem, limite);
    }

    @GetMapping("/pendencias")
    public List pendenciasAvaliacao(
            @RequestParam(required = false) Integer idScrim,
            @RequestParam(required = false) Boolean apenasPendentes
    ) {
        return dao.pendenciasAvaliacao(idScrim, apenasPendentes);
    }
}