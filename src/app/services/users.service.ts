import { Injectable } from '@angular/core';
import { User } from '../entities/user';
import { AuthService } from './auth.service';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentReference,
} from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { UserFactory } from '../entities/user-factory';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  usuarios: AngularFirestoreCollection<any>;

  constructor( public auth : AuthService, private _db : AngularFirestore) { 
    this.usuarios = this._db.collection('users');
  }

  getUsuario(uid : string){
    return this.usuarios.doc(uid).get();
  }
  
  getUsuarios() : Observable<any>{
    return this.usuarios.valueChanges({idField : 'uid'});
  }

  getCurrentUser(){
    return UserFactory.constructUser(JSON.parse(localStorage.getItem('user')!));
  }

  getCurrentAuthData(){
    return UserFactory.constructUser(JSON.parse(localStorage.getItem('auth')!));
  }

  getUserLogs(uid : string){
    return this._db.collection('logs').doc(uid).get();
  }
}
