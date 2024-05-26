import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { SpinnerComponent } from '../components/spinner/spinner.component';
import { CommonModule } from '@angular/common';
import { AngularMaterialModule } from '../material/angular-material.module';
import { Router } from '@angular/router';
import { GameService } from '../services/game.service';
import { User } from '@angular/fire/auth';
import { UsersService } from '../services/users.service';
import { Observable, combineLatest, firstValueFrom, lastValueFrom, map, take } from 'rxjs';
import { GameBoardComponent } from '../components/game-board/game-board.component';
import { imagenesMedallas } from '../constants/imagenes';
import { HighscoresListComponent } from '../components/highscores-list/highscores-list.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss','fireworks.scss'],
  standalone: true,
  imports: [IonicModule, SpinnerComponent, CommonModule, AngularMaterialModule, GameBoardComponent, HighscoresListComponent],
})
export class HomePage implements OnInit, OnDestroy {
  
  signingOut : boolean = false;
  selectedDifficulty? : 'easy' | 'medium' | 'hard';
  user? : any;
  highScores$? : Observable<{
    easy : {difficulty : string, score : number, userID : string, userName : string}[],
    medium : {difficulty : string, score : number, userID : string, userName : string}[],
    hard : {difficulty : string, score : number, userID : string, userName : string}[],
  }>;
  presentingElement : any;
  openResultsModal = false;
  resetBoard = false;
  modalHighScores :  {
    place : number;
    difficulty: string;
    score: number;
    userID: string;
    userName: string;
    isLast : boolean
  }[] = [];
  lastScore? : {
    difficulty: string;
    score: number;
    userID: string;
  };
  imagenesMedallas : string[] = imagenesMedallas;
  presentFireworks = false;
  showHighScoresComponent = false;

  constructor(private _auth : AuthService, private _router : Router, private _usersService : UsersService, private _gameService : GameService) {}

  ngOnInit() {
    this._auth.afAuth.currentUser.then(u => {
      firstValueFrom(this._usersService.getUsuario(u?.uid!)).then(u => {
        this.user = u.data();
      });
    });
    this.highScores$ = combineLatest([
      this._gameService.getScores('easy').valueChanges().pipe(map((easy : any) => easy.scores.sort((a : any, b : any) => a.score - b.score))),
      this._gameService.getScores('medium').valueChanges().pipe(map((medium : any) => medium.scores.sort((a : any, b : any) => a.score - b.score))),
      this._gameService.getScores('hard').valueChanges().pipe(map((hard : any) => hard.scores.sort((a : any, b : any) => a.score - b.score))),
    ]).pipe(
      map(([easy, medium, hard]) => ({
        easy,
        medium,
        hard
    })));
    this.presentingElement = document.querySelector('.content-with-full-height');
  }

  onGameCompleted(timer : number){
    this.presentFireworks = true;
    this.lastScore = {score : timer, difficulty : this.selectedDifficulty!, userID : this.user!.uid};
    this._gameService.uploadScore(timer,this.selectedDifficulty!,this.user!.uid,this.user.nombre).then(()=> {
      this.setModalData();
      this.presentFireworks = false;
    });
  }

  onMenuBtnClicked(){
    this.openResultsModal = false;
    this.selectedDifficulty = undefined;
  }

  onJugarBtnClicked(){
    this.openResultsModal = false;
    this.resetBoard = !this.resetBoard;
  }

  setModalData(){
    this.highScores$!
    .pipe(
      take(1),
      map(scores => {
        const dScores = scores[this.selectedDifficulty!].slice(0, 5); // Get the first 5 scores from medium
        let resultPlaceIndex = scores[this.selectedDifficulty!].findIndex(s=>s.score == this.lastScore?.score && s.userID == this.lastScore.userID);
        const isLastScoreIncluded = dScores.some(score => score.score == this.lastScore!.score && score.userID === this.lastScore!.userID); // Check if lastScore is included in the first 5 scores
  
        // Add isLast property to the scores and include the index of each element
        const scoresWithIsLastAndIndex : any[]= dScores.map((score, index) => ({
          ...score,
          isLast: isLastScoreIncluded && score.score == this.lastScore!.score && score.userID === this.lastScore!.userID, // Set isLast to true for lastScore, if included
          place: index + 1 // Add the index of each element
        }));
  
        // If lastScore is not in the first 5 scores, add it as the 6th element
        if (!isLastScoreIncluded) {
          scoresWithIsLastAndIndex.push({
            ...this.lastScore,
            isLast: true, // Set isLast to true for lastScore
            place : resultPlaceIndex + 1,
            userName : this.user!.nombre
          });
        }
  
        return scoresWithIsLastAndIndex;
      })
    )
    .subscribe(scores => {
      this.modalHighScores = scores;
      console.log("scores", this.modalHighScores);
      this.openResultsModal = true;
    });
  }

  async handleSingOut(){
    this.signingOut = true;
    await setTimeout(() => {
      this._auth.SignOut().then(() => {
        this._router.navigate(['login']);
      });
    }, 2000);
  }

  onHomeIconClicked(){
    this.showHighScoresComponent = false;
  }

  onPodiumIconClicked(){
    this.showHighScoresComponent = true;
  }

  ngOnDestroy(): void {
    this.openResultsModal = false;
    this.selectedDifficulty = undefined;
  }
}
  


