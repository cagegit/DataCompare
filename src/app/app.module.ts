import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule} from '@angular/forms';
import { HttpModule } from '@angular/http'
import { AppRoutingModule } from './app-routing/app-routing.module'; // 总体路由配置
import { ModalModule, TypeaheadModule, ProgressbarModule } from 'ngx-bootstrap';
import { ToastModule } from 'ng2-toastr/ng2-toastr';
import { customOptionProvider } from 'app/shared/toastr.option';

import { AppComponent } from './app.component';
import { CtComponent } from './ct.component';
import { LinksComponent } from './links/links.component';
import { RulesComponent } from './rules/rules.component';
import { JobsComponent } from './jobs/jobs.component';
import { BootstrapDialogService } from './shared/bootstrap-dialog.service';
import { HttpService } from './shared/http.service';
import { LinkServerService } from './links/link-server.service';
import { SqlTypePipe } from './shared/sqltype.pipe';
import { DbPanelComComponent } from './rules/depend/db-panel-com/db-panel-com.component';
import { TablePanelComComponent } from './rules/depend/table-panel-com/table-panel-com.component';
import { ColumnPanelComComponent } from './rules/depend/column-panel-com/column-panel-com.component';
import { FilterByPipe } from './shared/filter-by-pipe.pipe';
import { ApplyToOtherComponent } from './common/apply-to-other/apply-to-other.component';
import { RuleServerService } from './rules/rule-server.service';
import { RuleNowService } from './rules/rule-now.service';
import { ImportConfComponent } from './common/import-conf/import-conf.component';
import { MatchCountComponent } from './rules/depend/match-count/match-count.component';
// import { MatchDetailComponent } from './rules/depend/match-detail/match-detail.component';
// import { EqualValidatorDirective } from './shared/equal-validator.directive';

@NgModule({
  declarations: [
    AppComponent,
    CtComponent,
    LinksComponent,
    RulesComponent,
    JobsComponent,
    SqlTypePipe,
    DbPanelComComponent,
    TablePanelComComponent,
    ColumnPanelComComponent,
    FilterByPipe,
    ApplyToOtherComponent,
    ImportConfComponent,
    MatchCountComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    ProgressbarModule.forRoot(),
    TypeaheadModule.forRoot(),
    ModalModule.forRoot(),
    ToastModule.forRoot()
  ],
  providers: [
    customOptionProvider,
    BootstrapDialogService,
    HttpService,
    LinkServerService,
    RuleServerService,
    RuleNowService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
