package com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.controller;

import com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.dao.JogadorDao;
import com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.model.Jogador;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jogadores")
public class JogadorController {

    private final JogadorDao dao;

    public JogadorController(JogadorDao dao) {
        this.dao = dao;
    }

    @GetMapping
    public List<Jogador> listar() {
        return dao.listarTodos();
    }

    @GetMapping("/{id}")
    public Jogador buscar(@PathVariable int id) {
        return dao.buscarPorId(id);
    }

    @PostMapping
    public void criar(@RequestBody Jogador jogador) {
        dao.salvar(jogador);
    }

    @PutMapping("/{id}")
    public void atualizar(@PathVariable int id, @RequestBody Jogador jogador) {
        dao.atualizar(id, jogador);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable int id) {
        dao.deletar(id);
    }
}