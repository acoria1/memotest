import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Gesture, GestureController, IonicModule } from '@ionic/angular';
import { AngularMaterialModule } from 'src/app/material/angular-material.module';
import { SpinnerComponent } from '../spinner/spinner.component';
import { Observable } from 'rxjs';
import { imagenesMedallas } from 'src/app/constants/imagenes';
import { FormsModule } from '@angular/forms';

type Difficulty = 'easy' | 'medium' | 'hard';

@Component({
  selector: 'app-highscores-list',
  templateUrl: './highscores-list.component.html',
  styleUrls: ['./highscores-list.component.scss'],
  standalone: true,
  imports: [IonicModule, SpinnerComponent, CommonModule, AngularMaterialModule, FormsModule],
})
export class HighscoresListComponent  implements OnInit, AfterViewInit {

  @Input() highscores$? : Observable<{
    easy : {difficulty : string, score : number, userID : string, userName : string}[],
    medium : {difficulty : string, score : number, userID : string, userName : string}[],
    hard : {difficulty : string, score : number, userID : string, userName : string}[],
  }>;
  segmentValue : Difficulty = 'easy';
  imagenesMedallas = imagenesMedallas;
  showLoading = true;
  loadingProgress = 0;
  @ViewChild('highscoresRoot', { read: ElementRef }) highscoresRoot!: ElementRef;
  private gesture? : Gesture;

  constructor(private gestureCtrl: GestureController) { }

  ngOnInit() {
    let interval = setInterval(()=> {
      this.loadingProgress += 0.01;
      if (this.loadingProgress > 1.1){
        clearInterval(interval);
        this.showLoading = false;
      }
    },20)
  }

  ngAfterViewInit(): void {
    this.initializeGesture();
  }

  initializeGesture() {
    this.gesture = this.gestureCtrl.create({
      el: this.highscoresRoot.nativeElement,
      gestureName: 'swipe',
      threshold : 10,
      onStart: () => {},
      onMove: ev => {},
      onEnd: ev => {
        console.log(ev.deltaX);
        if (ev.deltaX > 50) { // Swipe left threshold
          if(this.segmentValue === "medium"){
            this.segmentValue = "easy";
          } else if (this.segmentValue === "hard"){
            this.segmentValue = "medium";
          }
        } else if (ev.deltaX < -50){ //Swipe right
          if(this.segmentValue === "medium"){
            this.segmentValue = "hard";
          } else if (this.segmentValue === "easy"){
            this.segmentValue = "medium";
          }
        }
      }
    });
    this.gesture.enable();
  }
}
