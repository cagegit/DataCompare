import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { RuleServerService } from '../../rule-server.service';
import { LinkServerService } from 'app/links/link-server.service';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { RuleNowService } from '../../rule-now.service';
import { Rule, DccpTip } from 'app/shared/rule/rule';
// import { Link } from 'app/shared/link';

@Component({
  selector: 'app-db-panel',
  templateUrl: './db-panel-com.component.html'
})
export class DbPanelComComponent implements OnInit, OnDestroy {
  @ViewChild('dbForm') dbForm;
  isCreate = false;
  dbInfo = {flag: '', remark: '', sourceDb: {id: 0, flag: ''}, targetDb: {id: 0, flag: ''}};
  sourceDbList = [];
  targetDbList = [];
  _rule: Rule;
  saveDbInfo() {
    if (this.isCreate) {
      this.ruleServer.saveMatchDbInfo(this.dbInfo).subscribe(res => {
        if (res.success) {
          const v = res.data;
          this.ruleNow.currentRule = new Rule(v.db_matching_id, v.db_match_name, v.db_id_1, v.db_id_2, this.dbInfo.sourceDb.flag, this.dbInfo.targetDb.flag);
          this.router.navigateByUrl('/rules/table');
        } else {
          this.toastr.error('数据库配置信息保存失败！', DccpTip.title);
        }
      });
    } else {
      this.ruleServer.editDbMatchInfo(this._rule.matchingId, this.dbInfo.flag, this.dbInfo.remark).subscribe(res => {
         if (res.success) {
           this.ruleNow.currentRule.matchingName = this.dbInfo.flag;
           this.ruleNow.currentRule.remark = this.dbInfo.remark;
           this.router.navigateByUrl('/rules/table');
         } else {
           this.toastr.error('数据库配置信息保存失败！', DccpTip.title);
         }
      });
    }
  }
  trackById(index, db) {
    return db.id;
  }
  constructor(private router: Router, private ruleServer: RuleServerService, private toastr: ToastsManager, private ruleNow: RuleNowService, private linkServer: LinkServerService) {
    // this.toastr.setRootViewContainerRef(vcr);
  }

  ngOnInit() {
    if (this.ruleNow.currentRule) {
      this.isCreate = false;
      this._rule = this.ruleNow.currentRule;
      const rule = this.ruleNow.currentRule;
      this.dbInfo.flag = rule.matchingName;
      this.dbInfo.remark = rule.remark;
      this.dbInfo.sourceDb.id = rule.sourceId;
      this.dbInfo.sourceDb.flag = rule.sourceName;
      this.dbInfo.targetDb.id = rule.targetId;
      this.dbInfo.targetDb.flag = rule.targetName;
    }else {
      this.isCreate = true;
    }
    this.linkServer.getAllLinks().subscribe(list => {
        this.sourceDbList = list;
        this.targetDbList = Object.assign(list);
        if (list.length > 0) {
          if (this.isCreate) {
            this.dbInfo.sourceDb = this.sourceDbList[0];
            this.dbInfo.targetDb = this.targetDbList[0];
          } else {
            for (let i = 0; i < this.sourceDbList.length; i++) {
               if (this.sourceDbList[i].id === this.dbInfo.sourceDb.id ) {
                 this.dbInfo.sourceDb = this.sourceDbList[i];
                 break;
               }
            }
            for (let i = 0; i < this.targetDbList.length; i++) {
              if (this.targetDbList[i].id === this.dbInfo.targetDb.id ) {
                this.dbInfo.targetDb = this.targetDbList[i];
                break;
              }
            }
          }
        }
    });
  }
  ngOnDestroy() {
    this.dbForm.form.reset();
  }
}
