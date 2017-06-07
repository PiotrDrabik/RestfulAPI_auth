import { Component, OnInit } from '@angular/core';
import { HttpsrvService } from './../httpsrv.service';

@Component({
    selector: 'app-post',
    templateUrl: './post.component.html',
    styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {
    user = {};
    userToDelete = '';
    constructor(public httpsrv: HttpsrvService) { }

    changeData(newValue) {
        console.log(newValue);
        this.httpsrv.selectData.newValue = newValue;
        let newData = this.httpsrv.selectData.oldValue.split(':');
        this.httpsrv.selectData.field = newData[0];
        this.httpsrv.change(this.httpsrv.selectData);
    };

    selectItem(selectedValue) {
        console.log(selectedValue);
        this.userToDelete = selectedValue;
    }

    deleteButton() {
        this.httpsrv.delete(this.userToDelete);
    }

    ngOnInit() {
    }

}
