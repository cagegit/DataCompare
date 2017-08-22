import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LinksComponent } from '../links/links.component';
import { RulesComponent } from '../rules/rules.component';
import { JobsComponent } from '../jobs/jobs.component';
import { DbPanelComComponent } from '../rules/depend/db-panel-com/db-panel-com.component';
import { TablePanelComComponent } from '../rules/depend/table-panel-com/table-panel-com.component';
import { ColumnPanelComComponent } from '../rules/depend/column-panel-com/column-panel-com.component';
import {MatchCountComponent} from '../rules/depend/match-count/match-count.component';

const routes: Routes = [
  { path: '', redirectTo: '/links', pathMatch: 'full' },
  { path: 'links',  component: LinksComponent },
  { path: 'rules',  component: RulesComponent, children: [
    {path: 'db', component: DbPanelComComponent},
    {path: 'table', component: TablePanelComComponent},
    {path: 'column', component: ColumnPanelComComponent},
    {path: 'statistics', component: MatchCountComponent},
    {path: '**', redirectTo: '/rules', pathMatch: 'full'},
  ] },
  { path: 'jobs',  component: JobsComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes, { useHash: true }) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
