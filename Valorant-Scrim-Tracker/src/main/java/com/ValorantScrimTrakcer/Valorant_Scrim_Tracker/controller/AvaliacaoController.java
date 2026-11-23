package com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.controller;

import com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.dao.AvaliacaoDao;
import com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.model.RespostaAvaliacao;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/avaliacoes")
public class AvaliacaoController {

    private final AvaliacaoDao dao;

    public AvaliacaoController(AvaliacaoDao dao) {
        this.dao = dao;
    }

    @PostMapping
    public void salvar(@RequestBody List<RespostaAvaliacao> respostas) {
        dao.salvarRespostas(respostas);
    }

    @GetMapping("/scrim/{idScrim}")
    public List AvaliacaoController(@PathVariable int idScrim) {
        return dao.listarRespostasPorScrim(idScrim);
    }
}