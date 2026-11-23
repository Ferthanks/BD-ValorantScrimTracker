package com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.controller;

import com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.dao.QuestaoDao;
import com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.model.Questao;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questoes")
public class QuestaoController {

    private final QuestaoDao dao;

    public QuestaoController(QuestaoDao dao) {
        this.dao = dao;
    }

    @GetMapping
    public List<Questao> listar() {
        return dao.listarTodas();
    }

    @GetMapping("/{id}")
    public Questao buscar(@PathVariable int id) {
        return dao.buscarPorId(id);
    }

    @PostMapping
    public void criar(@RequestBody Questao questao) {
        dao.salvar(questao);
    }

    @PutMapping("/{id}")
    public void atualizar(@PathVariable int id, @RequestBody Questao questao) {
        dao.atualizar(id, questao);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable int id) {
        dao.deletar(id);
    }
}