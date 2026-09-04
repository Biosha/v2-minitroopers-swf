import {
  AfterViewInit,
  Component,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { TrooperService } from 'src/app/services/trooper.service';

@Component({
  selector: 'app-debug',
  imports: [],
  templateUrl: './container-debug.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './container-debug.component.scss',
})
export class DebugComponent implements AfterViewInit {
  private trooperService = inject(TrooperService);
  private authService = inject(AuthService);

  toCreate = [1];

  destinyPath: any = {
    seed: 1453864,
    name: 'Fanbart',
    id: 1111,
    level: 2,
    army: 1,
    choices: [],
  };

  initialSkill1: any = '';
  initialSkill12: any = '';

  path: any = {};

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.realStartBattle();
  }

  init() {}

  realStartBattle() {
    const i = 4;
    for (const element of this.toCreate) {
      const container = document.getElementById('insert' + element);

      const ruffle = (window as any).RufflePlayer.newest();
      const player = ruffle.createPlayer();

      player.style.height = '710px';
      player.style.width = '720px';

      player.config = {
        allowScriptAccess: true,
        scale: 'noscale',
        wmode: 'transparent',
      };

      container?.appendChild(player);
      player.load({
        url: '/assets/swf/client_fr_edit.swf',
        parameters: this.embededUrl(element, i),
      });
      // i++;
      // if (i > 5) {
      //   i = 0;
      // }
    }
  }

  embededUrl(trooper: number, group: number) {
    // let data =
    //   'data=oy10%3A%253B%2501%250CZjy10%3AClientMode%3A2%3A2oy8%3A%25032%251A4y2%3ARVy8%3AV%251BE%257Cny6%3A%250CA2ci' +
    //   trooper +
    //   'y6%3AAn%25256jy11%3ATrooperType%3A0%3A0y8%3A%250Az%250Avahy5%3A7X%2501i1000y13%3A%257D%2526%2516Y%2501ahgi' +
    //   group +
    //   'y8%3A%2524PS%2501y55%3Ahttp%253A%252F%252Flocalhost%253A4200%252Fassets%252Fswf%252Fmini.swfg';

    const data =
      'data=oy10%3A%253B%2501%250CZjy10%3AClientMode%3A0%3A2oy7%3A%252AM%2501oy5%3A7X%2501jy14%3ABackgroundType%3A1%3A0y8%3A%2524PS%2501y14%3Abg%252Fattic.jpggR3i10089863y11%3Aa%255De%251B%2502aoy13%3A%25601%251F%252A%2502aoy8%3A%25032%251A4y11%3ALiumes%2520Jry8%3AV%251BE%257Coy9%3A%251DlQK%2503jy10%3AMoveSystem%3A1%3A0y13%3A%2511%2521%250Ea%2501jy12%3AReloadSystem%3A2%3A0y11%3A%25290%2519i%2503ahy15%3A%251A%2529%2513%253D%2501jy7%3ABodyLoc%3A3%3A0y13%3A%250BR%2510%251B%2502jy6%3AWeapon%3A18%3A0y13%3A%2515S%2517%253F%2503jy10%3ATargetType%3A0%3A0y6%3A%253BuXEjy12%3ATargetSystem%3A3%3A0gy6%3A%250CA2ci14818319y6%3AAn%25256jy11%3ATrooperType%3A0%3A0y8%3A%250Az%250Avai1zzzhR3zy13%3A%257D%2526%2516Y%2501ahgoR9y7%3AKevonesR11oR12jR13%3A1%3A0R14jR15%3A2%3A0R16ahR17jR18%3A1%3A0R19jR20%3A25%3A0R21jR22%3A0%3A0R23jR24%3A3%3A0gR25i8211553R26jR27%3A0%3A0R28ai1i1i1zhR3i1R29ahgoR9y7%3AMaxevesR11oR12jR13%3A1%3A0R14jR15%3A2%3A0R16ahR17jR18%3A2%3A0R19jR20%3A27%3A0R21jR22%3A0%3A0R23jR24%3A3%3A0gR25i11904809R26jR27%3A0%3A0R28ai1i1i1i2hR3i2R29ahgoR9y6%3AMaxeedR11oR12jR13%3A1%3A0R14jR15%3A2%3A0R16ahR17jR18%3A3%3A0' +
      'R19jR20' +
      // 'y13%3A%250BR%2510%251B%2502jy6%3AWeapon' +
      '%3A7%3A0R21jR22%3A0%3A0R23jR24%3A0%3A0gR25i20299718R26jR27%3A0%3A0R28ai1i1i1i1i1hR3i3R29ahghy13%3AK%2529%2516%250A%2502azi1i2i3hy9%3AOPz%2516%2503zgoy9%3Ac%25294p%2503zR8aoR9y3%3AratR11oR12jR13%3A1%3A0R14jR15%3A2%3A0R16ahR17nR19nR21jR22%3A0%3A0R23jR24%3A0%3A0gR25i97512R26jR27%3A2%3A0R28ahR3i4R29ajy5%3ASkill%3A55%3A0jR37%3A123%3A0hgoR9R36R11oR12jR13%3A1%3A0R14jR15%3A2%3A0R16ahR17nR19nR21jR22%3A0%3A0R23jR24%3A0%3A0gR25i47580R26jR27%3A2%3A0R28ahR3i5R29ajR37%3A74%3A0jR37%3A70%3A0hgoR9R36R11oR12jR13%3A1%3A0R14jR15%3A2%3A0R16ahR17nR19nR21jR22%3A0%3A0R23jR24%3A0%3A0gR25i89933R26jR27%3A2%3A0R28ahR3i6R29ajR37%3A55%3A0jR37%3A53%3A0hgoR9R36R11oR12jR13%3A1%3A0R14jR15%3A2%3A0R16ahR17nR19nR21jR22%3A0%3A0R23jR24%3A0%3A0gR25i54524R26jR27%3A2%3A0R28ahR3i7R29ajR37%3A97%3A0jR37%3A131%3A0hgoR9R36R11oR12jR13%3A1%3A0R14jR15%3A2%3A0R16ahR17nR19nR21jR22%3A0%3A0R23jR24%3A0%3A0gR25i28954R26jR27%3A2%3A0R28ahR3i8R29ajR37%3A97%3A0jR37%3A70%3A0hgoR9R36R11oR12jR13%3A1%3A0R14jR15%3A2%3A0R16ahR17nR19nR21jR22%3A0%3A0R23jR24%3A0%3A0gR25i46409R26jR27%3A2%3A0R28ahR3i9R29ajR37%3A131%3A0jR37%3A112%3A0hgoR9R36R11oR12jR13%3A1%3A0R14jR15%3A2%3A0R16ahR17nR19nR21jR22%3A0%3A0R23jR24%3A0%3A0gR25i75061R26jR27%3A2%3A0R28ahR3i10R29ajR37%3A97%3A0jR37%3A116%3A0hgoR9R36R11oR12jR13%3A1%3A0R14jR15%3A2%3A0R16ahR17nR19nR21jR22%3A0%3A0R23jR24%3A0%3A0gR25i55801R26jR27%3A2%3A0R28ahR3i11R29ajR37%3A79%3A0jR37%3A97%3A0hgoR9R36R11oR12jR13%3A1%3A0R14jR15%3A2%3A0R16ahR17nR19nR21jR22%3A0%3A0R23jR24%3A0%3A0gR25i19059R26jR27%3A2%3A0R28ahR3i12R29ajR37%3A74%3A0jR37%3A70%3A0hgoR9R36R11oR12jR13%3A1%3A0R14jR15%3A2%3A0R16ahR17nR19nR21jR22%3A0%3A0R23jR24%3A0%3A0gR25i61641R26jR27%3A2%3A0R28ahR3i13R29ajR37%3A114%3A0jR37%3A55%3A0hgoR9R36R11oR12jR13%3A1%3A0R14jR15%3A2%3A0R16ahR17nR19nR21jR22%3A0%3A0R23jR24%3A0%3A0gR25i24207R26jR27%3A2%3A0R28ahR3i14R29ajR37%3A114%3A0jR37%3A131%3A0hgoR9R36R11oR12jR13%3A1%3A0R14jR15%3A2%3A0R16ahR17nR19nR21jR22%3A0%3A0R23jR24%3A0%3A0gR25i51651R26jR27%3A2%3A0R28ahR3i15R29ajR37%3A97%3A0jR37%3A137%3A0hgoR9R36R11oR12jR13%3A1%3A0R14jR15%3A2%3A0R16ahR17nR19nR21jR22%3A0%3A0R23jR24%3A0%3A0gR25i5324R26jR27%3A2%3A0R28ahR3i16R29ajR37%3A112%3A0jR37%3A123%3A0hgoR9R36R11oR12jR13%3A1%3A0R14jR15%3A2%3A0R16ahR17nR19nR21jR22%3A0%3A0R23jR24%3A0%3A0gR25i59606R26jR27%3A2%3A0R28ahR3i17R29ajR37%3A137%3A0jR37%3A116%3A0hgoR9R36R11oR12jR13%3A1%3A0R14jR15%3A2%3A0R16ahR17nR19nR21jR22%3A0%3A0R23jR24%3A0%3A0gR25i24453R26jR27%3A2%3A0R28ahR3i18R29ajR37%3A114%3A0jR37%3A116%3A0hgoR9R36R11oR12jR13%3A1%3A0R14jR15%3A2%3A0R16ahR17nR19nR21jR22%3A0%3A0R23jR24%3A0%3A0gR25i77584R26jR27%3A2%3A0R28ahR3i19R29ajR37%3A74%3A0jR37%3A79%3A0hgoR9R36R11oR12jR13%3A1%3A0R14jR15%3A2%3A0R16ahR17nR19nR21jR22%3A0%3A0R23jR24%3A0%3A0gR25i34614R26jR27%3A2%3A0R28ahR3i20R29ajR37%3A116%3A0jR37%3A70%3A0hgoR9R36R11oR12jR13%3A1%3A0R14jR15%3A2%3A0R16ahR17nR19nR21jR22%3A0%3A0R23jR24%3A0%3A0gR25i39118R26jR27%3A2%3A0R28ahR3i21R29ajR37%3A116%3A0jR37%3A117%3A0hgoR9R36R11oR12jR13%3A1%3A0R14jR15%3A2%3A0R16ahR17nR19nR21jR22%3A0%3A0R23jR24%3A0%3A0gR25i78525R26jR27%3A2%3A0R28ahR3i22R29ajR37%3A55%3A0jR37%3A114%3A0hgoR9R36R11oR12jR13%3A1%3A0R14jR15%3A2%3A0R16ahR17nR19nR21jR22%3A0%3A0R23jR24%3A0%3A0gR25i62295R26jR27%3A2%3A0R28ahR3i23R29ajR37%3A116%3A0jR37%3A76%3A0hgoR9R36R11oR12jR13%3A1%3A0R14jR15%3A2%3A0R16ahR17nR19nR21jR22%3A0%3A0R23jR24%3A0%3A0gR25i3902R26jR27%3A2%3A0R28ahR3i24R29ajR37%3A123%3A0jR37%3A70%3A0hgoR9R36R11oR12jR13%3A1%3A0R14jR15%3A2%3A0R16ahR17nR19nR21jR22%3A0%3A0R23jR24%3A0%3A0gR25i10248R26jR27%3A2%3A0R28ahR3i25R29ajR37%3A123%3A0jR37%3A117%3A0hgoR9R36R11oR12jR13%3A1%3A0R14jR15%3A2%3A0R16ahR17nR19nR21jR22%3A0%3A0R23jR24%3A0%3A0gR25i57562R26jR27%3A2%3A0R28ahR3i26R29ajR37%3A116%3A0jR37%3A131%3A0hghR33ahR34zy13%3AU%252C%252A%257E%2501nghgzR5y55%3Ahttp%253A%252F%252Flocalhost%253A4200%252Fassets%252Fswf%252Farmy.swfg&amp;chk=26ceca6eb08468768b1d032627733d80&amp;imageurl=http://data.minitroopers.fr/img/&amp;endMsg=%3Cdiv%20class%20%3D%20%27centre%27%3E%3Cb%3E.%20.%20.%20.%20.%20.%20.%20%3A%20REDIFFUSION%20TERMINEE%20%3A%20.%20.%20.%20.%20.%20.%20.%3C%2Fb%3E%3C%2Fdiv%3E%3Cbr%20%2F%3E%3Cbr%20%2F%3EContinuer%20pour%20voir%20les%20autres%20combats%20de%20cette%20arm%E9e%20%21%3Cbr%20%2F%3E%3Cbr%20%2F%3E%3Cspan%20style%20%3D%20%27font-size%20%3A%2080%25%3B%27%3E%28%20Merci%20d%27utiliser%20Minitroopers%20-%20replay%20%29%3C%2Fspan%3E';

    // let data =
    //   'data=oy10%3A%253B%2501%250CZjy10%3AClientMode%3A2%3A2oy8%3A%25032%251A4y';

    // data += 3;
    // data += '%3A';
    // data += 'vvv';

    // data +=
    //   'y8%3AV%251BE%257Cny6%3A%250CA2ci' +
    //   trooper +
    //   'y6%3AAn%25256jy11%3ATrooperType%3A0%3A0y8%3A%250Az%250Avahy5%3A7X%2501i';

    // data += 11111;
    // data += 'y13%3A%257D%2526%2516Y%2501ahgi';

    // data += 1; // ?
    // data +=
    //   'y8%3A%2524PS%2501y55%3Ahttp%253A%252F%252Flocalhost%253A4200%252Fassets%252Fswf%252Fmini.swfg';

    // console.log(data);

    // console.log('---------------------');
    // let d = new URLSearchParams(data).get('data');

    // console.log(d);

    // console.log('---------------------');
    // let r = Unserializer.unserialize(d);

    // console.log(r);
    // console.log('---------------------');

    // const container = document.getElementById('insertHere2');
    // const ruffle = (window as any).RufflePlayer.newest();
    // const player = ruffle.createPlayer();

    // player.style.height = '71px';
    // player.style.width = '72px';

    // player.config = {
    //   allowScriptAccess: true,
    //   scale: 'noscale',
    //   wmode: 'transparent',
    // };

    // container?.appendChild(player);
    // player.load({
    //   url: '/assets/swf/client_fr_edit.swf',
    //   parameters: '',
    // });

    // this.getPathFromSeed(this.destinyPath.seed);

    return data;
  }

  getPathFromSeed(seed: number) {
    seed += 131;

    seed = (seed * 16807) % 2147483647;
    const skinColor = (seed & 1073741823) % 4;

    const count = skinColor == 2 || skinColor == 3 ? 5 : 4;

    for (let i = 0; i < count; i++) {
      seed = (seed * 16807) % 2147483647;
    }

    // console.log(seed);

    const loc3 = [0, 1, 2, 3];
    const idx = seed & 1073741823 & loc3.length;
  }
}
