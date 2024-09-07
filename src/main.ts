import * as ROSLIB from '@tier4/roslibjs-foxglove';
import p5 from 'p5';
import type { Match } from './msg';

import './style.css';

import SUSE_BoldSrc from './assets/SUSE-Bold.ttf';

let beginMs = 0;
let elapsedMs = -3000;
let running = false;
let soundPlayed: { [key: number]: boolean } = {};

let SUSE_Bold: p5.Font;

let match: Match | null = null;
let startSrv: ROSLIB.Service | null = null;

let rosConnected = false;
function rosConnect() {
  if (!rosConnected) {
    const ros = new ROSLIB.Ros({ url: `ws://${location.hostname}:8765` });

    ros.on('connection', () => {
      console.log('connected');
      rosConnected = true;
      const matchSub = new ROSLIB.Topic<Match>({
        ros,
        name: '/match/status',
        messageType: 'game_state_interfaces/msg/Match',
      });
      matchSub.subscribe((msg) => {
        match = msg;
      });

      startSrv = new ROSLIB.Service({
        ros,
        name: '/match/start',
        serviceType: 'std_srvs/srv/Empty',
      });
    });

    ros.on('close', () => {
      console.log('closed');
      rosConnected = false;
      startSrv = null;
    });

    ros.on('error', (error) => {
      console.error(error);
      rosConnected = false;
      startSrv = null;
    });
  }
}
rosConnect();
setInterval(rosConnect, 5000);

new p5((p: p5) => {
  p.preload = () => {
    SUSE_Bold = p.loadFont(SUSE_BoldSrc);
  };

  p.setup = () => {
    p.createCanvas(640, 360);
  };

  p.draw = () => {
    p.background('white');
    p.textFont(SUSE_Bold, 200);
    p.textAlign(p.CENTER, p.CENTER);
    p.strokeWeight(0);

    p.fill('black');

    if (running) {
      // TODO: 3分
      elapsedMs = p.millis() - beginMs;
      if (elapsedMs > 60 * 3 * 1000) {
        elapsedMs = 60 * 3 * 1000;
      }
    }
    const elapsed = Math.floor(elapsedMs / 1000);
    if (elapsed < 0) {
      if (running) {
        p.text((-elapsed).toString(), p.width / 2, p.height / 2 + 20);

        if (!soundPlayed[elapsed]) {
          soundPlayed[elapsed] = true;
        }
      }
    } else if (elapsed === 0) {
      p.text('START', p.width / 2, p.height / 2 + 20);
      if (running && !soundPlayed[elapsed]) {
        soundPlayed[elapsed] = true;
        // ここでservice送信
        startSrv?.callService({}, () => {});
      }
    } else {
      p.text(msToText(elapsedMs), p.width / 2, p.height / 2 + 20);
      // 点数表示
      p.textAlign(p.CENTER, p.CENTER);
      p.fill('red');
      p.textSize(120);
      p.text(match?.red_team.score ?? '', 120, 60);
      p.textAlign(p.CENTER, p.CENTER);
      p.fill('blue');
      p.text(match?.blue_team.score ?? '', p.width - 120, 60);
    }

    if (rosConnected) {
      p.fill('green');
    } else {
      p.fill('red');
    }
    p.circle(5, 5, 10);
  };

  p.keyPressed = () => {
    if (p.key === ' ' && !running) {
      //if (confirm('試合開始しますか？')) {
      running = true;
      beginMs = p.millis() - elapsedMs;
      //}
    } else if (p.key === ' ' && running) {
      running = false;
    } else if (p.key === 'Enter') {
      running = false;
      elapsedMs = -3000;
      soundPlayed = {};
    }
  };

  // biome-ignore lint/style/noNonNullAssertion: <explanation>
}, document.querySelector<HTMLDivElement>('#app')!);

function msToText(ms: number) {
  const sec = Math.floor(ms / 1000);
  return `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`;
}
