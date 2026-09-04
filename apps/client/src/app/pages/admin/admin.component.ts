import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DebugComponent } from 'src/app/components/containers/container-debug/container-debug.component';

@Component({
  selector: 'app-admin',
  imports: [DebugComponent],
  templateUrl: './admin.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './admin.component.scss',
})
export class AdminComponent {
  constructor() {
    // const data =
    //   'oy10:%3B%01%0CZjy10:ClientMode:2:2oy8:%032%1A4y6:Victory8:V%1BE%7Cny6:%0CA2ci20237673y6:An%256jy11:TrooperType:0:0y8:%0Az%0Avai1i1i0hy5:7X%01i1000y13:%7D%26%16Y%01ahgi5y8:%24PS%01y55:http%3A%2F%2Flocalhost%3A4200%2Fassets%2Fswf%2Fmini.swfg';
    // const deobfuscatedData = objectObfuscator(data);
  }
}
