import { Injectable } from '@angular/core';
import { imagenesAnimales, imagenesFrutas, imagenesHerramientas } from '../constants/imagenes-cartas';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { lastValueFrom } from 'rxjs';

@Injectable({
providedIn: 'root'
})
export class GameService {

    constructor(private _db : AngularFirestore) {}

    getShuffledCards(pairType : 'animales' | 'herramientas' | 'frutas'): { id: number; image: string; revealed: boolean; matched: boolean; cardBack? : string }[] {
        switch (pairType) {
            case 'animales':
                return this.shuffleArray(this.getCards(imagenesAnimales));
            case 'herramientas':
                return this.shuffleArray(this.getCards(imagenesHerramientas));
            case 'frutas':
                return this.shuffleArray(this.getCards(imagenesFrutas));
        }
    }

    getCards(set : {cardBack : string, cardImages : {path : string}[]}) : { id: number; image: string; revealed: boolean; matched: boolean; cardBack? : string }[]{
        let cards : any = [];
        set.cardImages.forEach((image, index) => {
            cards.push({ id: index * 2, image: image.path, revealed: false, matched: false, cardBack : set.cardBack});
            cards.push({ id: index * 2 + 1, image: image.path, revealed: false, matched: false, cardBack : set.cardBack });
        });
        return cards;
    }

    shuffleArray(array: any[]): any[] {
        let currentIndex = array.length, temporaryValue, randomIndex;

        while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
        }

        return array;
    }

    getScores(difficulty : string){
        return this._db.collection("mt_scores").doc(difficulty);
    }

    async uploadScore(score : any, difficulty : string, userID : string, username : string) : Promise<void>{
        let scoresRef = this._db.collection("mt_scores").doc(difficulty);
        let data = await lastValueFrom(scoresRef.get());
        let currentScores = data.data() as { scores : any[]};
        currentScores.scores.push({
                score : score,
                difficulty : difficulty,
                userID : userID,
                userName : username,
        });
        return scoresRef.update(currentScores);
    }
}
