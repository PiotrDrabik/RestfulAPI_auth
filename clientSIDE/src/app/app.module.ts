import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { PostComponent } from './post/post.component';
import { HttpsrvService } from './httpsrv.service';
import { SelectComponent } from './select/select.component';

@NgModule({
  declarations: [
    AppComponent,
    PostComponent,
    SelectComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [HttpsrvService],
  bootstrap: [AppComponent]
})
export class AppModule { }
