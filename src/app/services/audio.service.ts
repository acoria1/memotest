import { Injectable } from '@angular/core';
import { NativeAudio } from '@awesome-cordova-plugins/native-audio';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  constructor() {}

  preloadAudio(key: string, assetPath: string) {
    NativeAudio.preloadSimple(key, assetPath)
      .then(() => console.log('Audio is preloaded'))
      .catch((error) => console.error('Error preloading audio', error));
  }

  playAudio(key: string) {
    NativeAudio.play(key)
      .then(() => console.log('Audio is playing'))
      .catch((error) => console.error('Error playing audio', error));
  }

  unloadAudio(key : string){
    NativeAudio.unload(key)
  }

  loadPlayAndUnload(key : string, assetPath : string){
    NativeAudio.preloadSimple(key, assetPath)
      .then(() => {
        console.log('Audio is preloaded');
        NativeAudio.play(key, () => NativeAudio.unload(key))
        .catch((error) => console.error('Error playing audio', error))
        })
      .catch((error) => console.error('Error preloading audio', error));
  }
}
