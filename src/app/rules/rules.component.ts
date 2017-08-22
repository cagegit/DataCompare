import {Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Rule, DccpTip } from 'app/shared/rule/rule';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { RuleServerService } from './rule-server.service';
import { BootstrapDialogService } from 'app/shared/bootstrap-dialog.service';
import {RuleNowService} from 'app/rules/rule-now.service';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.css']
})
export class RulesComponent implements OnInit, OnDestroy {
  @ViewChild('viewModal') viewModel: ModalDirective;
  ruleList: Rule[] = [];
  ruleTitle = '新建匹配规则';
  isMatching = false;
  retry = true;
  rules$;
  delayTime = 3000; // 请求延迟间隔
  createRule() {
    this.ruleNow.currentRule = undefined;
    this.ruleNow.currentTable = undefined;
    this.ruleTitle = '新建匹配规则';
    this.viewModel.show();
    this.router.navigateByUrl('/rules/db');
  }
  getAllRules () {
    if (this.rules$) {
      this.rules$.unsubscribe();
    }
    // let expandCount = 0;
    this.rules$ = this.ruleServer.getAllRules()
      .expand(() => {
        return this.ruleServer.getAllRules().delay(this.delayTime);
      })
      .takeWhile(() => this.retry)
      .subscribe(res => {
        if (res.success) {
          let arr = [];
          arr = res.list.filter(v => (v.status >= 1 && v.status < 3));
          if (arr.length === 0) {
            this.retry = false;
          }
          this.ruleList = res.list;
        } else {
          this.toastr.error('获取规则列表失败!', DccpTip.title);
        }
    });
  }
  closeModel() {
    console.log('db model is close!');
    this.refreshRules();
    this.router.navigateByUrl('/rules');
  }
  deleteRule(rule: Rule) {
    if (rule.status > 0 && rule.status < 5) {
      this.toastr.error('当前规则正在被使用中，不能删除!', DccpTip.title);
      return;
    }
    const that = this;
    const deleteRule = function () {
      that.ruleServer.deleteRule(rule.matchingId).subscribe(res => {
        if (res.success) {
          that.toastr.success('删除成功!', DccpTip.title);
          that.refreshRules();
        } else {
          that.toastr.error('删除失败!', DccpTip.title);
        }
      });
    };
    this.dialog.confirm({
      title:  DccpTip.title,
      message: '确认要删除当前规则吗？',
      type: 'type-warning',
      btnCancelLabel: '取消',
      btnOKLabel: '确认',
      btnOKClass: 'btn-warning',
      closable: true,
      size: 'size-small',
      callback: function(result) {
        if (result) {
          deleteRule();
        }
      }
    });
  }
  editRule(rule: Rule) {
    this.ruleNow.currentRule = rule;
    this.ruleTitle = `${rule.matchingName}-修改匹配规则`;
    this.viewModel.show();
    this.router.navigateByUrl('/rules/db');
  }
  matchCount(item: Rule) {
    this.ruleTitle = `${item.matchingName}-比对结果统计`;
    this.ruleNow.currentRule = item;
    this.router.navigateByUrl('/rules/statistics');
    this.viewModel.show();
  }
  // 刷新列表
  refreshRules() {
    this.retry = true;
    this.getAllRules();
  }
  // 开始比对
  startToMatch(item: Rule) {
    this.isMatching = true;
    this.ruleServer.startToMatch(item.matchingId).subscribe(res => {
       if (res.success) {
         this.toastr.success('比对启动成功！', DccpTip.title);
         item.status = 1;
         this.refreshRules();
       } else {
         this.toastr.error('比对启动失败！', DccpTip.title);
       }
    }, err => {
      console.log(err);
      this.isMatching = false;
    }, () => {
      this.isMatching = false;
    });
  }
  // 重新比对
  restartToMatch(item: Rule) {
    this.isMatching = true;
    this.ruleServer.restartToMatch(item.matchingId).subscribe(res => {
      if (res.success) {
        this.toastr.success('重新比对启动成功！', DccpTip.title);
        item.status = 1;
        this.refreshRules();
      } else {
        this.toastr.error('重新比对启动失败！', DccpTip.title);
      }
    }, err => {
      console.log(err);
      this.isMatching = false;
    }, () => {
      this.isMatching = false;
    });
  }
  // 停止比对
  stopToMatch(item: Rule) {
    this.isMatching = true;
    this.ruleServer.stopToMatch(item.matchingId).subscribe(res => {
      if (res.success) {
        this.toastr.success('比对停止成功！', DccpTip.title);
        item.status = 5;
      } else {
        this.toastr.error('比对停止失败！', DccpTip.title);
      }
    }, err => {
      console.log(err);
      this.isMatching = false;
    }, () => {
      this.isMatching = false;
    });
  }
  constructor(private dialog: BootstrapDialogService, private router: Router, private ruleServer: RuleServerService, private toastr: ToastsManager, private ruleNow: RuleNowService) {}

  ngOnInit() {
    this.getAllRules();
    this.router.navigateByUrl('/rules');
  }
  ngOnDestroy() {
    this.ruleNow.currentRule = undefined;
    this.ruleNow.currentTable = undefined;
    if (this.rules$) {
      this.rules$.unsubscribe();
    }
    this.viewModel.hide();
  }
}
