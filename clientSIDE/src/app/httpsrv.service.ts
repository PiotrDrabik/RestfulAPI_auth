import { Injectable } from '@angular/core';
import { Headers, RequestOptions, Http, HttpModule, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class HttpsrvService {
    token: string;
    receivedGetData;
    server = 'http://localhost:8080';
    urls = {
        get: `${this.server}/authuser/users`,
        login: `${this.server}/authuser/login`,
        post : `${this.server}/authuser/user`, // create new
        put: `${this.server}/authuser/user`,
        delete: `${this.server}/authuser/user`
    };
    exampleUser = {
        'nip': 7535671100,
        'name': 'P.H.U. Ząbek',
        'firstname': 'Arnold',
        'lastname': 'Maliniak',
        'phone': 697123774,
        'email': 'zabek00@buziaczek.pl',
        'password': 'ludka12',
        'role': [ 'editor' ]
    };
    inputDisabled = false;
    selectData = {
        id: '',
        oldValue: '',
        newValue: '',
        field: ''
    };
    constructor(public http: Http) { }

    getUser = function () {
        let options = this.prepareHeader();
        this.http.get(this.urls.get, options)
            .map((res: Response) => res.json())
            .subscribe(
                (response) => {
                    this.receivedGetData = response;
                },
                (err) => {
                    this.commonError(err);
                },
                () => {
                    console.log('COMPLETED'); /* stream completed */
                }
            );
    };

    commonError = function(err) {
            console.log('ERROR: ' + err);
            console.log(err);
    };

    login = function (userData) {
        let body = JSON.stringify({ nip: '7542111000', password: 'Zosia17@ok' });
        let options = this.prepareHeader();
        this.http.post(this.urls.login, body, options)
            .map((res: Response) => res.json())
            .subscribe(
                (response) => {
                    console.log(response);
                    this.token = response.token;
                },
                (err) => {
                    this.commonError(err);
                },
                () => {
                    console.log('COMPLETED');
                }
            );
    };

    create = function () {
        let options = this.prepareHeader();
        let body = JSON.stringify(this.exampleUser);
        this.http.post(this.urls.post, body, options)
            .map((res: Response) => res.json())
            .subscribe(
                (response) => {
                    /* this function is executed every time there's a new output */
                    console.log('VALUE RECEIVED: ' + response);
                    console.log(response);
                },
                (err) => {
                    this.commonError(err);
                }
            );
    };

    change = function (userData) {
        let options = this.prepareHeader();
        let newBody = {[userData.field] : userData.newValue};
        let body = JSON.stringify(newBody);
        this.http.put(`${this.urls.put}/${userData.id}`, body, options)
            .map((res: Response) => res.json())
            .subscribe(
                (response) => {
                    console.log('VALUE RECEIVED: ' + response);
                    console.log(response);
                },
                (err) => {
                    this.commonError(err);
                },
            );
    };

    delete = function (userId) {
        let options = this.prepareHeader();
        this.http.delete(`${this.urls.put}/${userId}`, options)
            .map((res: Response) => res.json())
            .subscribe(
                (response) => {
                    console.log('VALUE RECEIVED: ' + response);
                    console.log(response);
                },
                (err) => {
                    this.commonError(err);
                },
            );
    };

    prepareHeader = function() {
        let headers;
        if (this.token) {
            headers = new Headers({ 'Authorization': `JWT ${this.token}`, 'Content-Type': 'application/json' });
        } else {
            headers = new Headers({ 'Content-Type': 'application/json' });
            }
        let options = new RequestOptions({ headers: headers });
        return options;
    };

}
