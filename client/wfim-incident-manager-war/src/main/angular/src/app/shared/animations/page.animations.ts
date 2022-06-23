import {animate, state, style, transition, trigger} from '@angular/animations';

export const enterExitLeft = trigger('enterExitLeft',
  [
    state('open', style({width:330, transform: 'translateX(0)'})),
    state('closed', style({width:0, 'min-width':0, flex:'0 0 1em', visibility:'hidden'})),
    transition('closed => open', [
        style({width:330, transform: 'translateX(-100%)'}),
        animate(100)
    ]),
    transition('void => open', [
        style({width:330, transform: 'translateX(-100%)'}),
        animate(100)
    ]),
    transition('open => void', [
        style({width:330, position:'absolute'}),
        animate(100, style({transform: 'translateX(-100%)'}))
    ]),
    transition('open => closed', [
        style({width:330, position:'absolute'}),
        animate(100, style({transform: 'translateX(-100%)'}))
    ]),
  ]);

export const enterExitRightFade = trigger('enterExitRightFade',[
    state('open', style({transform: 'translateX(-50%) translateY(-50%)', opacity:1})),
    state('closed', style({opacity:0, display:'none !important', visibility:'hidden'})),
    transition('closed => open', [
        style({opacity:0, width:'100vw', transform: 'translateX(100%) translateY(-50%)'}),
        animate(150)
    ]),
    transition('void => open', [
        style({opacity:0, width:'100vw', transform: 'translateX(100%) translateY(-50%)'}),
        animate(150)
    ]),
    transition('open => void', [
        style({opacity:1, width:'100vw', position:'absolute'}),
        animate(150, style({opacity:0, transform: 'translateX(100%) translateY(-50%)'}))
    ]),
    transition('open => closed', [
        style({opacity:1, width:'100vw', position:'absolute'}),
        animate(150, style({opacity:0, transform: 'translateX(100%) translateY(-50%)'}))
    ]),
  ]);

export const fadeInOut =
  trigger('fadeInOut', [
    state('open', style({opacity: 1})),
    state('closed', style({opacity:0, display:'none', visibility:'hidden'})),
    transition('void => open', [
      style({opacity: 0}),
      animate(100)
    ]),
    transition('closed => open', [
      style({opacity: 0}),
      animate(100)
    ]),
    transition('open => void', [
      animate(100, style({opacity: 0}))
    ]),
    transition('open => closed', [
      animate(100, style({opacity: 0}))
    ])
  ]);
