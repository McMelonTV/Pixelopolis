import { Boot } from './scenes/Boot.ts';
import { GameOver } from './scenes/GameOver.ts';
import { Game as MainGame } from './scenes/Game.ts';
import { MainMenu } from './scenes/MainMenu.ts';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader.ts';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        GameOver
    ]
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
