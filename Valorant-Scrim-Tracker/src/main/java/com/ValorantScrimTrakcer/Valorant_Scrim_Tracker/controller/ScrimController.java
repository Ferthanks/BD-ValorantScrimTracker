package com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.controller;

import com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.dao.ScrimDao;
import com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.model.Jogador;
import com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.model.Questao;
import com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.model.Scrim;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/scrims")
public class ScrimController {

    private final ScrimDao dao;

    public ScrimController(ScrimDao dao) {
        this.dao = dao;
    }

    @GetMapping
    public List<Scrim> listar() {
        return dao.listarTodas();
    }

    @GetMapping("/{id}")
    public Scrim buscar(@PathVariable int id) {
        return dao.buscarPorId(id);
    }

    @PostMapping
    public Map<String, Integer> criar(@RequestBody Scrim scrim) {
        int idGerado = dao.salvar(scrim);
        return Map.of("idScrim", idGerado);
    }

    @PutMapping("/{id}")
    public void atualizar(@PathVariable int id, @RequestBody Scrim scrim) {
        dao.atualizar(id, scrim);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable int id) {
        dao.deletar(id);
    }

    @GetMapping("/{id}/jogadores")
    public List<Jogador> listarJogadores(@PathVariable int id) {
        return dao.listarJogadoresDaScrim(id);
    }

    @GetMapping("/{id}/questoes")
    public List<Questao> listarQuestoes(@PathVariable int id) {
        return dao.listarQuestoesDaScrim(id);
    }
}