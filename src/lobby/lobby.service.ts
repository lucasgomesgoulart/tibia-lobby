import { Body, HttpException, HttpStatus, Injectable, NotFoundException, Put } from '@nestjs/common';
import { FindAllParameters, LobbyDto } from './lobby.dto';
import {v4 as uuid} from 'uuid';

@Injectable()
export class LobbyService {

    private lobbys: LobbyDto[] = [];

    create(lobby: LobbyDto) {
        lobby.id = uuid()
        console.log(lobby.id)
        this.lobbys.push(lobby);
    }

    findById(id: string): LobbyDto {
        const foundLobby = this.lobbys.find(lobby => lobby.id === id)
        if (foundLobby) {
            return foundLobby
        }
        throw new HttpException(`Lobby with id ${id} not found`, HttpStatus.NOT_FOUND);
    }

    update(lobby: LobbyDto) {
        let lobbyIndex = this.lobbys.findIndex(t => t.id === lobby.id);
        if (lobbyIndex >= 0) {
            this.lobbys[lobbyIndex] = lobby
            return lobby
        }
        throw new HttpException(`Lobby with id ${lobby.id} not found`, HttpStatus.NOT_FOUND);
    }

    delete(id: string): LobbyDto {
        const lobbyIndex = this.lobbys.findIndex(t => t.id === id)
        this.lobbys.splice(lobbyIndex, 1)
        return
    }

    findAll(params: FindAllParameters): LobbyDto[] {
        let filteredLobbys = this.lobbys;
        if (params.id) {
            filteredLobbys = filteredLobbys.filter(lobby => lobby.id === params.id);
        }
        if (params.title) {
            filteredLobbys = filteredLobbys.filter(lobby =>
                lobby.title.toLowerCase().includes(params.title.toLowerCase())
            );
        }
        if (params.minLevel !== undefined) {
            filteredLobbys = filteredLobbys.filter(lobby => lobby.minLevel >= params.minLevel);
        }
        if (params.maxLevel !== undefined) {
            filteredLobbys = filteredLobbys.filter(lobby => lobby.maxLevel <= params.maxLevel);
        }
        if (params.maxPlayers !== undefined) {
            filteredLobbys = filteredLobbys.filter(lobby => lobby.maxPlayers <= params.maxPlayers);
        }
        if (params.minPlayers !== undefined) {
            filteredLobbys = filteredLobbys.filter(lobby => lobby.minPlayers >= params.minPlayers);
        }
        if (params.activityType) {
            filteredLobbys = filteredLobbys.filter(lobby => lobby.activityType === params.activityType);
        }
        if (params.ownerId) {
            filteredLobbys = filteredLobbys.filter(lobby => lobby.ownerId === params.ownerId);
        }
        return filteredLobbys;
    }
}
