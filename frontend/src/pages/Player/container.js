import { Container } from "unstated";

const generateRandom = max => Math.random() * max;

class Player extends Container {
  state = {
    repeatOne: false,
    repeatAll: true,
    currentIndex: -1,
    songQueue: []
  };

  setup({ songQueue, currentIndex }) {
    this.setState({
      songQueue,
      currentIndex
    });
  }

  randomSong = () => {
    let nextIndex;
    while (true) {
      nextIndex = generateRandom(this.state.songQueue.length - 1);
      if (nextIndex !== this.state.currentIndex) break;
    }
    this.setState({
      currentIndex: nextIndex
    });
  };

  //TODO fix
  changeRepeatStatus = () => {
    this.setState({
      repeatOne: !this.state.repeatOne
    });
  };

  nextQueueSong = () => {
    if (this.state.repeatOne) {
      return this.changeSong(0);
    }
    this.nextSong();
  };

  changeSong(diff) {
    let nextIndex = this.state.currentIndex + diff;
    if (nextIndex < 0) {
      nextIndex = this.state.songQueue.length - 1;
    }
    if (nextIndex === this.state.songQueue.length) {
      nextIndex = 0;
    }
    this.setState({
      currentIndex: nextIndex
    });
  }

  nextSong = () => {
    this.changeSong(1);
  };

  previousSong = () => {
    this.changeSong(-1);
  };
}

export default Player;
