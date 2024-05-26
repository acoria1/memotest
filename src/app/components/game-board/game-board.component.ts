import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { AngularMaterialModule } from 'src/app/material/angular-material.module';
import { AuthService } from 'src/app/services/auth.service';
import { GameService } from 'src/app/services/game.service';
import { UsersService } from 'src/app/services/users.service';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.scss'],
  standalone: true,
  imports: [IonicModule, SpinnerComponent, CommonModule, AngularMaterialModule],
})
export class GameBoardComponent  implements OnInit, OnChanges, OnDestroy {

  cards: any[] = [];
  firstCard: any = null;
  secondCard: any = null;
  lockBoard: boolean = false;
  timer: number = 0;
  interval: any;
  signingOut : boolean = false;
  
  @Input() difficulty : 'easy' | 'medium' | 'hard' = 'easy';
  @Input() resetted : boolean = false;
  @Output() completed = new EventEmitter<number>();

  constructor(private gameService: GameService, private _auth : AuthService, private _router : Router) {}

  ngOnInit() {
    this.startGame();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes["difficulty"] && !changes["difficulty"].isFirstChange()){
      this.startGame();
    } else if(changes["resetted"] && !changes["resetted"].isFirstChange()){
      this.startGame();
    }
  }

  ngOnDestroy(): void {
    
  }

  startGame() {
    this.cards = this.gameService.getShuffledCards(this.getCardSetName(this.difficulty));
    this.startTimer();
  }

  getCardSetName(difficulty : 'easy' | 'medium' | 'hard')  : 'animales' | 'herramientas' | 'frutas'  {
    switch (difficulty) {
      case 'medium':
        return "herramientas"
      case 'hard':
        return "frutas"
      default:
        return "animales"
    }
  }

  startTimer() {
    this.timer = 0;
    this.interval = setInterval(() => {
      this.timer += 10;
    }, 10);
  }

  onCardClicked(card: any) {
    if (!card.revealed && !card.matched) {
      if (this.lockBoard) return;
      if (card === this.firstCard) return;

      card.revealed = true;

      if (!this.firstCard) {
        this.firstCard = card;
        return;
      }

      this.secondCard = card;
      this.checkForMatch();
    }
  }

  checkForMatch() {
    const isMatch = this.firstCard.image === this.secondCard.image;
    isMatch ? this.disableCards() : this.unflipCards();
  }

  disableCards() {
    this.firstCard.matched = true;
    this.secondCard.matched = true;
    this.resetBoard();

    if (this.cards.every(card => card.matched)) {
      this.handleGameEnding();
    }
  }

  handleGameEnding(){
    clearInterval(this.interval);
    this.completed.emit(this.timer);
    // setTimeout(() => {
    //   this.resetGame();
    // }, 500);
  }

  unflipCards() {
    this.lockBoard = true;

    setTimeout(() => {
      this.firstCard.revealed = false;
      this.secondCard.revealed = false;
      this.resetBoard();
    }, 1000);
  }

  resetBoard() {
    [this.firstCard, this.secondCard] = [null, null];
    this.lockBoard = false;
  }

  resetGame() {
    this.cards.forEach(card => {
      card.revealed = false;
      card.matched = false;
    });
    this.resetBoard();
    // setTimeout(() => {
    //   this.startGame();
    // }, 1000); // Wait for cards to flip back before starting a new game
  }
}
