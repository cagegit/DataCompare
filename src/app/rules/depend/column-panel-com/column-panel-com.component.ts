import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { BootstrapDialogService } from 'app/shared/bootstrap-dialog.service';
import { Column } from 'app/shared/rule/rule'
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/observable/of';
import {Observer} from 'rxjs/Observer';
import {RuleNowService} from 'app/rules/rule-now.service';
import {RuleServerService} from 'app/rules/rule-server.service';
import { Rule, DccpTip} from 'app/shared/rule/rule';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
declare let $: any;
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-column-panel',
  templateUrl: './column-panel-com.component.html'
})
export class ColumnPanelComComponent implements OnInit, OnDestroy {
  @ViewChild('viewModal') viewModal: ModalDirective;
  @ViewChild('filterModal') conditionModal: ModalDirective;
  @ViewChild('strategyModal') strategyModal: ModalDirective;
  @ViewChild('applyOther') applyOther;
  private colOb: Observer<object>;
  private colOb1: Observer<object>;
  private rxIns;
  private rxIns1;
  private rxNew = Observable.create(observer => {
      this.colOb = observer;
  });
  private rxNew1 = Observable.create(observer => {
    this.colOb1 = observer;
  });
  _rule: Rule;
  _table;
  ckAll = false;
  sourceColumns: Array<Column> = [];
  targetColumns: Array<Column> = [];
  selSourceCol: Column = {};
  selTargetCol: Column = {};
  confColumns = [];
  sourceList = [];
  targetList = [];
  confList = [];
  loading1 = false;
  loading2 = false;
  loading3 = false;
  tableAll = false;
  autoColumnList = [];
  loadingCol = false;
  appendBtn = '添加 >>';
  appending = false;
  filterRule = {sourceRule: '', targetRule: ''};
  condition = false;
  strategy = false;
  _ruleList = [];
  fastRule = {sourceRule: '', targetRule: '', match: 'detail'};
  fastDefaultRules = [{id: 1, name: 'sum(*)'}, {id: 2, name: 'count(*)'}];
  detailRule = {md5: 0, maxLen: 0, match: 'md5'};
  nowStrategy = 'condition'; // 包含4种：condition, fast, md5, maxLen
  isSaving = false;
  // column排序
  colTrack(index) {
    return index;
  }
  // 未配置表搜索
  searchColumn(val: string, type: number) {
    val = val.toLowerCase();
    this.colOb.next({val: val, type: type});
  }
  // 已配置表搜索
  searchExist(sourceStr: string, targetStr: string) {
    sourceStr = sourceStr.toLowerCase();
    targetStr = targetStr.toLowerCase();
    this.colOb1.next({source: sourceStr, target: targetStr});
  }
  // 全选框
  checkAll() {
    if (this.ckAll) {
      this.confColumns.forEach(v => {
        v.checked = true;
      });
    } else {
      this.confColumns.forEach(v => {
        v.checked = false;
      });
    }
  }
  // 删除已配置列
  removeColumn(col) {
    const that = this;
    this.dialog.confirm({
      title: 'Dccp 提示',
      message: '确认要删除当前列吗？',
      type: 'type-warning',
      btnCancelLabel: '取消',
      btnOKLabel: '确认',
      btnOKClass: 'btn-warning',
      closable: true,
      size: 'size-small',
      callback: function(result) {
        if (result) {
          // this.confColumns = this.confColumns.filter(res => (res.source_name !== col.source_name && res.target_name !== col.target_name));
          that.deleteMatchColumns([col.c_matching_id]);
        }
      }
    });
  }
  // 获取源端column列表
  getColumns1() {
    this.loading1 = true;
    this.ruleServer.getUnmatchColumnList(this._rule.matchingId, this._table.t_matching_id, 1)
      .subscribe(res => {
          if (res.success) {
            this.sourceColumns = res.data;
            this.sourceList = Object.assign(res.data);
          }
      }, err => {
        console.log(err);
        this.loading1 = false;
       }, () => {
        this.loading1 = false;
      });
  }
  // 获取目标端column列表
  getColumns2() {
    this.loading2 = true;
    this.ruleServer.getUnmatchColumnList(this._rule.matchingId, this._table.t_matching_id, 2)
      .subscribe(res => {
        if (res.success) {
          this.targetColumns = res.data;
          this.targetList = Object.assign(res.data);
        }
      }, err => {
        console.log(err);
        this.loading2 = false;
      }, () => {
        this.loading2 = false;
      });
  }
  // 获取已匹配列表
  getMatchList() {
    this.loading3 = true;
    this.ruleServer.getMatchColumnList(this._table.t_matching_id)
      .subscribe(res => {
        if (res.success) {
          this.confColumns = res.data;
          this.confList = Object.assign(res.data);
        }
      }, err => {
        console.log(err);
        this.loading3 = false;
      }, () => {
        this.loading3 = false;
      });
  }
  // 获取比对策略
  getMatchStrategy() {
    this.ruleServer.getStrategys(this._table.t_matching_id).subscribe(res => {
       if (res.success && res.data) {
         const st = res.data;
         if (st.whereFilter) {
              this.condition = !!(st.whereFilter.where_str1 || st.whereFilter.where_str2);
         } else {
             this.condition = false;
         }
         this.strategy = false;
         if (st.fastMatch) {
             this.strategy = true;
         } else {
           if (st.detailMatch) {
             this.strategy = true;
           }
         }
       }
    });
  }
  // 添加到已匹配列表
  appendToRules() {
    if (!this.selSourceCol.column_name) {
      this.toastr.error('请选择要添加的源库列', DccpTip.title);
      return ;
    }
    if (!this.selTargetCol.column_name) {
      this.toastr.error('请选择要添加的目标库列', DccpTip.title);
      return ;
    }
    this.appending = true;
    this.appendBtn = '添加中...';
    this.ruleServer.saveColumnMatch(this._table.t_matching_id, [{column_name_1: this.selSourceCol.column_name , column_name_2: this.selTargetCol.column_name}])
      .subscribe(res => {
        if (res.success) {
          // this.getTables(1);
          // this.getTables(2);
          this.sourceColumns = this.sourceColumns.filter(v => v.column_name !== this.selSourceCol.column_name);
          this.targetColumns = this.targetColumns.filter(v => v.column_name !== this.selTargetCol.column_name);
          this.selSourceCol = {};
          this.selTargetCol = {};
          $('input:radio[name="tbLeft"]').attr('checked', false);
          $('input:radio[name="tbRight"]').attr('checked', false);
          this.getMatchList();
        } else {
          this.toastr.error('添加失败！',  DccpTip.title);
        }
      }, err => {
        console.log(err);
        this.appending = false;
        this.appendBtn = '添加 >>';
      }, () => {
        this.appending = false;
        this.appendBtn = '添加 >>';
      });
  }
  // 根据选中删除数据
  deleteRightColumns() {
    const that = this;
    const arr = [];
    for (const v of this.confColumns) {
      if (v.checked) {
        arr.push(v.c_matching_id);
      }
    }
    if (arr.length === 0) {
      this.toastr.error('您没有选中任何数据！', DccpTip.title);
      return;
    }
    this.dialog.confirm({
      title:  DccpTip.title,
      message: '确认要删除选中列吗？',
      type: 'type-warning',
      btnCancelLabel: '取消',
      btnOKLabel: '确认',
      btnOKClass: 'btn-warning',
      closable: true,
      size: 'size-small',
      callback: function(result) {
        if (result) {
          that.deleteMatchColumns(arr);
        }
      }
    });
  }
  getAutoColumns() {
    this.loadingCol = true;
    this.autoColumnList = [];
    this.ruleServer.getAutoColumnMatchList(this._table.t_matching_id)
      .subscribe(res => {
        this.tableAll = false;
        if (res.success) {
          this.autoColumnList = res.list;
          this.viewModal.show();
        } else {
          this.toastr.error('获取自动匹配列表失败！', DccpTip.title);
        }
      }, err => {
        console.log(err);
        this.loadingCol = false;
      }, () => {
        this.loadingCol = false;
      });
  }
  deleteMatchColumns(arr: Array<string | number>) {
      this.ruleServer.deleteColumnMatch(this._table.t_matching_id, arr).subscribe(res => {
        if (res.success) {
          this.toastr.success('删除成功！', DccpTip.title);
          this.getMatchList();
          this.getColumns1();
          this.getColumns2();
        } else {
          this.toastr.error('删除失败！', DccpTip.title);
        }
      });
  }
  selectTableAll() {
    this.autoColumnList.forEach(v => {
      v.checked = this.tableAll;
    });
  }
  selectTableOne(tb) {
    let num = 0;
    if (tb.checked) {
      this.autoColumnList.forEach(v => {
        if (v.checked) {
          num ++;
        }
      });
      if (this.autoColumnList.length === num) {
        this.tableAll = true;
      }
    } else {
      this.tableAll = false;
    }
  }
  saveAutoList() {
    const arr = [];
    this.autoColumnList.forEach(t => {
      if (t.checked) {
        arr.push({column_name_1: t.column_name_1, column_name_2: t.column_name_2});
      }
    });
    if (arr.length === 0) {
      this.toastr.error('你没有选中任何数据！', DccpTip.title);
      return;
    }
    this.isSaving = true;
    this.ruleServer.saveColumnMatch(this._table.t_matching_id, arr)
      .subscribe(res => {
        if (res.success) {
          this.toastr.success('保存成功！', DccpTip.title);
          this.getMatchList();
          this.getColumns1();
          this.getColumns2();
          this.viewModal.hide();
        } else {
          this.toastr.error('保存失败！', DccpTip.title);
        }
      }, err => {
        console.log(err);
        this.isSaving = false;
      }, () => {
        this.isSaving = false;
      });
  }
  ruleTrack(i) {
    return i;
  }
  // 添加过滤条件
  addCondition() {
    this.condition = true;
    this.nowStrategy = 'condition';
    this.ruleServer.getStrategys(this._table.t_matching_id).subscribe(res => {
        if (res.success) {
          const st = res.data;
          this.filterRule.sourceRule = (st.whereFilter && st.whereFilter.where_str1) ? st.whereFilter.where_str1 : '';
          this.filterRule.targetRule = (st.whereFilter && st.whereFilter.where_str2) ? st.whereFilter.where_str2 : '';
          this.conditionModal.show();
        } else {
          this.toastr.error('获取过滤条件失败！', DccpTip.title);
        }
    });
  }
  // 添加比对策略
  addStrategy() {
    this.strategy = true;
    this.ruleServer.getStrategys(this._table.t_matching_id).subscribe(res => {
      if (res.success) {
        const st = res.data;
        if (st.fastMatch) {
          this.nowStrategy = 'fast';
          this.fastRule.match = 'fast';
          this.fastRule.sourceRule = st.fastMatch.fast_str1 ? st.fastMatch.fast_str1 : '';
          this.fastRule.targetRule = st.fastMatch.fast_str2 ? st.fastMatch.fast_str2 : '';
        } else {
          if (st.detailMatch) {
            this.nowStrategy = 'detail';
            this.fastRule.match = 'detail';
            this.detailRule.md5 = st.detailMatch.md5_length ? parseInt(st.detailMatch.md5_length, 10) : 0;
            this.detailRule.maxLen = st.detailMatch.max_data_length ? parseInt(st.detailMatch.max_data_length, 10) : 0;
          }
        }
        this.strategyModal.show();
      } else {
        this.toastr.error('获取比对策略失败！', DccpTip.title);
      }
    });
  }
  // 获取要应用的表列表
  saveStrategy($event) {
    if (this.nowStrategy === 'condition') {
      this.ruleServer.saveCondition($event, this.filterRule.sourceRule, this.filterRule.targetRule)
        .subscribe(res => {
          if (res.success) {
            this.toastr.success('保存成功！', DccpTip.title);
          } else {
            this.toastr.error('保存失败！', DccpTip.title);
          }
        }, err => console.log(err), () => {
          this.applyOther.viewModal.hide();
        });
    } else  if (this.nowStrategy === 'fast') {
      this.ruleServer.saveFastMatch($event, this.fastRule.sourceRule, this.fastRule.targetRule)
        .subscribe(res => {
          if (res.success) {
            this.toastr.success('保存成功！', DccpTip.title);
          } else {
            this.toastr.error('保存失败！', DccpTip.title);
          }
        }, err => console.log(err), () => {
          this.applyOther.viewModal.hide();
        });
    } else if (this.nowStrategy === 'md5') {
      this.ruleServer.saveMd5Condition($event, this.detailRule.md5)
        .subscribe(res => {
          if (res.success) {
            this.toastr.success('保存成功！', DccpTip.title);
          } else {
            this.toastr.error('保存失败！', DccpTip.title);
          }
        }, err => console.log(err), () => {
          this.applyOther.viewModal.hide();
        });
    } else if (this.nowStrategy === 'maxLen') {
      this.ruleServer.saveMaxDataLength($event, this.detailRule.maxLen)
        .subscribe(res => {
          if (res.success) {
            this.toastr.success('保存成功！', DccpTip.title);
          } else {
            this.toastr.error('保存失败！', DccpTip.title);
          }
        }, err => console.log(err), () => {
          this.applyOther.viewModal.hide();
        });
    }
  }
  // 应用到其他表
  applyToOtherTables(type: string) {
    this.nowStrategy = type;
    this.ruleServer.getMatchTables(this._rule.matchingId).subscribe(res => {
        if (res.success) {
            this._ruleList = res.list;
          this.applyOther.viewModal.show();
        } else {
          this.toastr.error('获取列表失败！', DccpTip.title);
        }
    });
  }
  // 保存过滤条件
  saveFilterRule() {
    this.ruleServer.saveCondition([this._table.t_matching_id], this.filterRule.sourceRule, this.filterRule.targetRule)
      .subscribe(res => {
          if (res.success) {
            this.toastr.success('保存过滤条件成功！', DccpTip.title);
            this.conditionModal.hide();
          } else {
            this.toastr.error('保存过滤条件失败！', DccpTip.title);
          }
      });
  }
  // 保存策略信息
  saveStrategyRule() {
     const arr = [this._table.t_matching_id];
     if (this.fastRule.match === 'fast') {
       this.ruleServer.saveFastMatch(arr, this.fastRule.sourceRule, this.fastRule.targetRule)
         .subscribe(res => {
             if (res.success) {
               this.toastr.success('快速比对策略保存成功！', DccpTip.title);
               this.strategyModal.hide();
             } else {
               this.toastr.error('快速比对策略保存失败！', DccpTip.title);
             }
         });
     } else {
       Observable.forkJoin([this.ruleServer.saveMd5Condition(arr, this.detailRule.md5), this.ruleServer.saveMaxDataLength(arr, this.detailRule.maxLen)])
         .subscribe(res => {
            if (res[0].success && res[1].success) {
              this.toastr.success('详细比对策略保存成功！', DccpTip.title);
            } else {
              this.toastr.error('详细比对策略保存失败！', DccpTip.title);
            }
       });
     }
  }
  // 关闭过滤条件弹窗
  closeFilterModal() {
    if (!this.filterRule.sourceRule && !this.filterRule.targetRule) {
        this.condition = false;
    }
  }
  // 关闭策略弹窗
  closeStrategyModal() {
    if (this.fastRule.match === 'fast') {
       if (!this.fastRule.sourceRule && !this.fastRule.targetRule) {
         this.strategy = false;
       }
    } else {
      if (this.detailRule.md5 < 1 && this.detailRule.maxLen < 1) {
        this.strategy = false;
      }
    }
  }
  constructor(private dialog: BootstrapDialogService, private ruleNow: RuleNowService, private ruleServer: RuleServerService, private router: Router, private toastr: ToastsManager) {}
  ngOnInit() {
    // console.log(this.fastRule.match);
    if (this.ruleNow.currentRule && this.ruleNow.currentTable) {
       this._rule = this.ruleNow.currentRule;
       this._table = this.ruleNow.currentTable;
       this.getColumns1();
       this.getColumns2();
       this.getMatchList();
       this.getMatchStrategy();
    } else {
      this.router.navigateByUrl('/rules');
    }
    this.rxIns = this.rxNew
      .debounceTime(300)
      .distinctUntilChanged()
      .do(res => {
        if (res.type === 1) {
          this.sourceColumns = this.sourceList.filter(item => item.column_name.toLowerCase().indexOf(res.val) >= 0);
        } else if (res.type === 2) {
          this.targetColumns = this.targetList.filter(item => item.column_name.toLowerCase().indexOf(res.val) >= 0);
        }
      })
      .subscribe();
    this.rxIns1 = this.rxNew1
      .debounceTime(300)
      .distinctUntilChanged()
      .do(res => {
        let arr = this.confList;
        if (res.source) {
          arr = this.confList.filter(rs => rs.column_name_1.toLowerCase().indexOf(res.source) >= 0);
        }
        if (res.target) {
          arr = this.confList.filter(rs => rs.column_name_2.toLowerCase().indexOf(res.target) >= 0);
        }
        this.confColumns = arr;
      })
      .subscribe();
  }
  ngOnDestroy() {
    this.rxIns.unsubscribe();
    this.rxIns1.unsubscribe();
  }
}
