import { Component, OnInit, Input } from '@angular/core';
import { HttpsrvService } from './../httpsrv.service';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./../post/post.component.css']
})
export class SelectComponent implements OnInit {
  @Input()
    listData = {};

  constructor(public httpsrv: HttpsrvService) { }

  changeList(id, selectedValue) {
      this.httpsrv.inputDisabled = true;
      this.httpsrv.selectData.oldValue = selectedValue;
      console.log(selectedValue);
      console.log(id);
      this.httpsrv.selectData.id = id;
  }

  ngOnInit() {
  }

}
